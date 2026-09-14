import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Walks the real R2 upload path end to end: ticket → presigned part PUTs →
 * complete → signed playback → delete.
 *
 * This is the browser's exact sequence, so it proves the bucket, the
 * credentials and the CORS policy together. The one thing it cannot prove is
 * the CORS preflight itself — only a browser sends one — but it does read the
 * ETag off each part response, which is the header the policy has to expose.
 */
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const env = Object.fromEntries(
  readFileSync(resolve(ROOT, '.env'), 'utf8')
    .split('\n').map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]),
)

const BASE = process.env.API_BASE || 'http://localhost:3001/api/v1'
let token = ''
let pass = 0
let fail = 0

async function api(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json().catch(() => null)
  return { status: res.status, data: json?.data, error: json?.error }
}

async function check(label, fn) {
  try {
    const detail = await fn()
    pass += 1
    console.log(`  ok   ${label}${detail ? '  — ' + detail : ''}`)
  } catch (err) {
    fail += 1
    console.log(`  FAIL ${label}  — ${err.message}`)
  }
}
const must = (c, m) => { if (!c) throw new Error(m) }

/**
 * A 12 MB body, so the multipart path actually splits: R2 requires every part
 * but the last to be at least 5 MB, and a small file would quietly take the
 * single-PUT branch and prove nothing about parts or ETags.
 */
const SIZE = 12 * 1024 * 1024
const payload = Buffer.alloc(SIZE, 7)

const login = await fetch(`${BASE}/auth/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD }),
}).then((r) => r.json())
token = login?.data?.token
console.log(token ? `\nsigned in — bucket ${env.R2_VIDEO_BUCKET}\n` : '\nLOGIN FAILED\n')

let ticket = null
let videoId = ''

console.log('── multipart upload ──')
await check('POST /videos/uploads returns presigned parts', async () => {
  const r = await api('POST', '/videos/uploads', {
    filename: 'r2-smoke-test.mp4',
    contentType: 'video/mp4',
    sizeBytes: SIZE,
    title: 'R2 smoke test',
  })
  must(r.status === 201, `status ${r.status} ${r.error?.message || ''}`)
  ticket = r.data
  videoId = ticket.videoId
  must(ticket.parts.length >= 1, 'no parts')
  return `${ticket.partCount} part(s) of ${(ticket.partSize / 1048576).toFixed(0)} MB → ${ticket.objectKey}`
})

const etags = []
await check('PUT each part straight to R2, reading back the ETag', async () => {
  for (const part of ticket.parts) {
    const start = (part.partNumber - 1) * ticket.partSize
    const chunk = payload.subarray(start, Math.min(start + ticket.partSize, SIZE))
    const res = await fetch(part.url, { method: 'PUT', body: chunk })
    must(res.ok, `part ${part.partNumber}: HTTP ${res.status}`)
    const etag = res.headers.get('etag')
    must(etag, `part ${part.partNumber}: no ETag on the response`)
    etags.push({ partNumber: part.partNumber, etag })
  }
  return `${etags.length} part(s) accepted, ETags present`
})

await check('complete stitches them', async () => {
  const r = await api('POST', `/videos/uploads/${videoId}/complete`, { parts: etags })
  must(r.status === 200, `status ${r.status} ${r.error?.message || ''}`)
  must(r.data.status === 'ready', `status ${r.data.status}`)
  // The size comes from a HEAD against the bucket, not from what we claimed.
  must(r.data.sizeBytes === SIZE, `bucket says ${r.data.sizeBytes}, uploaded ${SIZE}`)
  return `ready, ${(r.data.sizeBytes / 1048576).toFixed(0)} MB confirmed by the bucket`
})

console.log('\n── playback ──')
await check('GET /videos/:id/playback returns a working signed URL', async () => {
  const r = await api('GET', `/videos/${videoId}/playback`)
  must(r.status === 200 && r.data.url, `status ${r.status} ${r.error?.message || ''}`)
  // GET, not HEAD: the URL is signed for GetObject and the HTTP method is part
  // of that signature, so a HEAD against it fails on the signature rather than
  // on anything being wrong. One byte is enough to prove it serves.
  const probe = await fetch(r.data.url, { headers: { Range: 'bytes=0-0' } })
  must(probe.ok, `signed URL not playable: HTTP ${probe.status}`)
  const total = Number(String(probe.headers.get('content-range') || '').split('/')[1])
  must(total === SIZE, `signed URL reports ${total} bytes, uploaded ${SIZE}`)
  return `signed URL OK, expires ${r.data.expiresAt}`
})

await check('a Range request works, so seeking works', async () => {
  const r = await api('GET', `/videos/${videoId}/playback`)
  const res = await fetch(r.data.url, { headers: { Range: 'bytes=0-1023' } })
  must(res.status === 206, `expected 206 Partial Content, got ${res.status}`)
  return `206, ${res.headers.get('content-range')}`
})

await check('the bucket is private — the raw URL is not public', async () => {
  const url = new URL((await api('GET', `/videos/${videoId}/playback`)).data.url)
  const unsigned = `${url.origin}${url.pathname}`
  const res = await fetch(unsigned, { method: 'HEAD' })
  must(!res.ok, `UNSIGNED URL RETURNED ${res.status} — the bucket is public, signing is decorative`)
  return `unsigned → HTTP ${res.status}`
})

console.log('\n── cleanup ──')
await check('DELETE removes the object and the row', async () => {
  const r = await api('DELETE', `/videos/${videoId}`)
  must(r.status === 200, `status ${r.status} ${r.error?.message || ''}`)
  const gone = await api('GET', `/videos/${videoId}`)
  must(gone.status === 404, `row still there: ${gone.status}`)
  return 'object and row gone'
})

console.log(`\n${'─'.repeat(56)}\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
