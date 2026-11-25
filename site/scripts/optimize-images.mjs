/**
 * Shrinks the images in public/ to what the pages actually display.
 *
 *   node scripts/optimize-images.mjs
 *
 * @nuxt/image does nothing for us in production: the site is served from
 * Cloudflare Pages, where the ipx optimiser cannot run, so <NuxtImg> emits the
 * file in public/ untouched. Whatever is in public/ is what a visitor
 * downloads — a 1750px, 1.1 MB PNG for a logo shown 80px tall, for instance.
 *
 *  - PNG  -> a .webp written next to it (the PNG is left alone; point the code
 *            at the .webp). Logos are capped at LOGO_HEIGHT, photos at PHOTO_WIDTH.
 *  - WebP -> re-encoded in place when it is wider than PHOTO_WIDTH or the
 *            result is at least 20% smaller.
 *
 * Safe to re-run: a PNG whose .webp is newer is skipped, and a WebP that would
 * not shrink is left as it is.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, dirname, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const PUBLIC = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')
const LOGO_HEIGHT = 240 // shown at most 80px tall; 3x for dense screens
const PHOTO_WIDTH = 1920
const kb = n => `${Math.round(n / 1024)} KB`.padStart(8)

const walk = dir =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })

// Extra, smaller copies for the places that show an image small: a logo cut
// from a full-size picture, or the narrower hero files a phone picks through
// srcset. [source, output, resize] — written when missing or older than the source.
const VARIANTS = [
  ['monaco.jpeg', 'monaco-logo.webp', { height: 288 }], // shown at most 96px tall
  ['stretch.jpg', 'stretch-logo.webp', { height: 144 }], // header logo, 48px tall
  ['homepage-hero.webp', 'homepage-hero-800.webp', { width: 800 }],
  ['homepage-hero.webp', 'homepage-hero-1200.webp', { width: 1200 }],
]
const variantOutputs = new Set(VARIANTS.map(v => v[1]))

let before = 0
let after = 0

for (const file of walk(PUBLIC)) {
  const rel = file.slice(PUBLIC.length + 1).split(sep).join('/')
  if (variantOutputs.has(rel)) continue
  const isLogo = rel.startsWith('logos/')
  const size = statSync(file).size
  const resize = isLogo
    ? { height: LOGO_HEIGHT, withoutEnlargement: true }
    : { width: PHOTO_WIDTH, withoutEnlargement: true }
  // Read into memory first: on Windows sharp keeps a file it opened by path
  // locked, and the in-place rewrite below then fails.
  const source = readFileSync(file)
  const encode = () =>
    sharp(source).rotate().resize(resize).webp({ quality: isLogo ? 85 : 78, effort: 6 }).toBuffer()

  if (/\.png$/i.test(rel)) {
    const out = file.replace(/\.png$/i, '.webp')
    try {
      if (statSync(out).mtimeMs >= statSync(file).mtimeMs) continue
    }
    catch { /* no .webp yet */ }
    const buf = await encode()
    writeFileSync(out, buf)
    before += size
    after += buf.length
    console.log(`${kb(size)} -> ${kb(buf.length)}  ${rel} -> .webp`)
  }
  else if (/\.webp$/i.test(rel)) {
    const { width } = await sharp(source).metadata()
    const buf = await encode()
    if (width <= PHOTO_WIDTH && buf.length > size * 0.8) continue
    writeFileSync(file, buf)
    before += size
    after += buf.length
    console.log(`${kb(size)} -> ${kb(buf.length)}  ${rel}`)
  }
}

for (const [from, to, resize] of VARIANTS) {
  const src = join(PUBLIC, from)
  const out = join(PUBLIC, to)
  try {
    if (statSync(out).mtimeMs >= statSync(src).mtimeMs) continue
  }
  catch { /* not made yet */ }
  const buf = await sharp(readFileSync(src)).rotate().resize({ ...resize, withoutEnlargement: true }).webp({ quality: 80, effort: 6 }).toBuffer()
  writeFileSync(out, buf)
  console.log(`${kb(statSync(src).size)} -> ${kb(buf.length)}  ${from} -> ${to}`)
}

console.log(`\n${kb(before)} -> ${kb(after)} in total`)
