/**
 * One-off migration: upload the blog images that currently live as relative
 * paths in `site/public` (e.g. `/marathon.png`) to Cloudflare R2, then rewrite
 * every blog_posts reference (cover image + inline section images) to the public
 * R2 URL. Also rewrites the matching string literals in `src/seed.ts` so a fresh
 * seed stays consistent.
 *
 * Why: the CRM and the public site are served from different origins, so a
 * root-relative path only resolves on the site. Hosting the images on R2 gives
 * both apps a single absolute URL that always works.
 *
 * Run: npx tsx src/scripts/migrate-blog-images.ts [--dry-run]
 *
 * Idempotent: references already pointing at R2 are skipped, and uploads use
 * stable keys (`blog/seed/<filename>`) so re-running overwrites the same object.
 */
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { readFile, writeFile, access } from 'fs/promises'
import path from 'path'
import { pool } from '../config/db'
import { env } from '../config/env'

const DRY_RUN = process.argv.includes('--dry-run')

// site/public lives three levels up from src/scripts.
const PUBLIC_DIR = path.resolve(__dirname, '../../../site/public')
const SEED_FILE = path.resolve(__dirname, '../seed.ts')

/**
 * Some posts reference filenames that no longer exist in site/public.
 * Map them to the closest existing asset (confirmed with the owner).
 */
const FALLBACKS: Record<string, string> = {
  '/individual-hero.png': 'individual-hero.webp',
  '/event-warmup.png': 'warm-up.webp',
  '/hero-physiotherapy.png': 'recovery-place.webp',
}

const CONTENT_TYPE: Record<string, string> = {
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
}

function isLocalRef(v: unknown): v is string {
  return typeof v === 'string' && v.startsWith('/') && !v.startsWith('//')
}

function isAlreadyMigrated(v: unknown): boolean {
  return typeof v === 'string' && !!env.r2.publicBaseUrl && v.startsWith(env.r2.publicBaseUrl + '/')
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

let _client: S3Client | null = null
function client(): S3Client {
  if (!_client) {
    _client = new S3Client({
      region: 'auto',
      endpoint: `https://${env.r2.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.r2.accessKeyId,
        secretAccessKey: env.r2.secretAccessKey,
      },
    })
  }
  return _client
}

/** Resolve a blog ref (e.g. `/marathon.png`) to a real file in site/public. */
async function resolveSourceFile(ref: string): Promise<string | null> {
  const direct = path.join(PUBLIC_DIR, ref)
  if (await fileExists(direct)) return direct

  const fallback = FALLBACKS[ref]
  if (fallback) {
    const fb = path.join(PUBLIC_DIR, fallback)
    if (await fileExists(fb)) return fb
  }
  return null
}

/** Upload one local file to R2 under a stable key and return its public URL. */
async function uploadToR2(absPath: string): Promise<string> {
  const filename = path.basename(absPath)
  const ext = path.extname(filename).toLowerCase()
  const contentType = CONTENT_TYPE[ext] || 'application/octet-stream'
  const key = `${(env.r2.prefix || 'blog').replace(/\/$/, '')}/seed/${filename}`
  const url = `${env.r2.publicBaseUrl}/${key}`

  if (DRY_RUN) return url

  const body = await readFile(absPath)
  await client().send(
    new PutObjectCommand({
      Bucket: env.r2.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  )
  return url
}

async function main(): Promise<void> {
  console.log(`[migrate-blog-images] ${DRY_RUN ? 'DRY RUN — no writes' : 'LIVE — uploading + updating DB'}`)
  console.log(`[migrate-blog-images] public dir: ${PUBLIC_DIR}`)

  if (!env.r2.publicBaseUrl || !env.r2.bucket) {
    throw new Error('R2 is not configured (R2_PUBLIC_BASE_URL / R2_BUCKET missing)')
  }

  const parseContent = (c: any): any[] => (typeof c === 'string' ? JSON.parse(c) : c) || []

  // ── 1. Load all posts (published + drafts) ──────────────────────────
  // The DB row-update step is the goal, but R2 upload + seed.ts rewrite do not
  // need the DB. If the DB is unreachable (e.g. Supabase paused), degrade
  // gracefully: derive the image list from seed.ts and finish the DB step on a
  // later re-run.
  let rows: any[] = []
  let dbAvailable = true
  try {
    const res = await pool.query('SELECT id, slug, cover_image, content_en, content_vi FROM blog_posts')
    rows = res.rows
    console.log(`[migrate-blog-images] ${rows.length} posts loaded from DB`)
  } catch (e: any) {
    dbAvailable = false
    console.warn(`[migrate-blog-images] ⚠ DB unavailable (${e.message}) — will upload to R2 + rewrite seed.ts only`)
  }

  const seedSource = await readFile(SEED_FILE, 'utf8')

  // ── 2. Collect every distinct local image reference ─────────────────
  const refs = new Set<string>()
  if (dbAvailable) {
    for (const row of rows) {
      if (isLocalRef(row.cover_image)) refs.add(row.cover_image)
      for (const col of ['content_en', 'content_vi'] as const) {
        for (const section of parseContent(row[col])) {
          if (isLocalRef(section?.image)) refs.add(section.image)
        }
      }
    }
  } else {
    // Fall back to scanning seed.ts for quoted local image paths.
    const re = /'(\/[^']+\.(?:png|webp|jpe?g|gif|svg|avif))'/gi
    for (const m of seedSource.matchAll(re)) refs.add(m[1])
  }
  console.log(`[migrate-blog-images] ${refs.size} distinct local image refs`)

  // ── 3. Upload each ref's source file → build ref→URL map ────────────
  const urlByRef = new Map<string, string>()
  const missing: string[] = []
  for (const ref of refs) {
    const src = await resolveSourceFile(ref)
    if (!src) {
      missing.push(ref)
      console.warn(`  ✗ MISSING source for ${ref} — skipped`)
      continue
    }
    const url = await uploadToR2(src)
    urlByRef.set(ref, url)
    const note = path.basename(src) !== path.basename(ref) ? `  (fallback → ${path.basename(src)})` : ''
    console.log(`  ✓ ${ref} → ${url}${note}`)
  }

  // ── 4. Rewrite each post and persist changed rows ───────────────────
  let updated = 0
  for (const row of rows) {
    let changed = false

    let cover = row.cover_image
    if (isLocalRef(cover) && urlByRef.has(cover)) {
      cover = urlByRef.get(cover)!
      changed = true
    }

    const rewriteSections = (c: any): any[] => {
      const sections = parseContent(c)
      for (const section of sections) {
        if (isLocalRef(section?.image) && urlByRef.has(section.image)) {
          section.image = urlByRef.get(section.image)!
          changed = true
        }
      }
      return sections
    }
    const contentEn = rewriteSections(row.content_en)
    const contentVi = rewriteSections(row.content_vi)

    if (!changed) continue
    updated++
    if (DRY_RUN) {
      console.log(`  would update ${row.slug}`)
      continue
    }
    await pool.query(
      'UPDATE blog_posts SET cover_image = $1, content_en = $2, content_vi = $3, updated_at = $4 WHERE id = $5',
      [cover, JSON.stringify(contentEn), JSON.stringify(contentVi), new Date().toISOString(), row.id]
    )
    console.log(`  updated ${row.slug}`)
  }

  // ── 5. Keep seed.ts consistent (replace quoted local-path literals) ──
  let seedReplacements = 0
  let seed = await readFile(SEED_FILE, 'utf8')
  for (const [ref, url] of urlByRef) {
    const before = seed
    seed = seed.split(`'${ref}'`).join(`'${url}'`)
    if (seed !== before) seedReplacements++
  }
  if (!DRY_RUN && seedReplacements > 0) {
    await writeFile(SEED_FILE, seed, 'utf8')
  }

  // ── Summary ─────────────────────────────────────────────────────────
  console.log('\n[migrate-blog-images] Summary')
  console.log(`  uploaded refs : ${urlByRef.size}${DRY_RUN ? ' (dry-run, not uploaded)' : ''}`)
  console.log(`  posts updated : ${dbAvailable ? updated : 'SKIPPED — DB unavailable'}`)
  console.log(`  seed.ts refs  : ${seedReplacements} ${DRY_RUN ? '(not written)' : 'rewritten'}`)
  if (missing.length) console.log(`  missing srcs  : ${missing.join(', ')}`)
  if (!dbAvailable) {
    console.log('\n  ⚠ Existing DB rows were NOT updated (database unreachable).')
    console.log('    Once Supabase is reachable, finish with:')
    console.log('      npx tsx src/scripts/migrate-blog-images.ts')
  }

  await pool.end()
  process.exit(0)
}

main().catch(async (err) => {
  console.error('[migrate-blog-images] Error:', err)
  await pool.end()
  process.exit(1)
})
