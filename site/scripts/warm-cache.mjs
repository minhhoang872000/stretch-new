#!/usr/bin/env node
/**
 * Warm the KV page cache right after a deploy.
 *
 *   node scripts/warm-cache.mjs [https://stretch.vn]
 *
 * Every deploy starts with an empty SSR cache (the cache name carries the build
 * id — see SSR_CACHE in nuxt.config.ts). Until a page has been rendered once,
 * the next visitor pays for a full render on the Worker, which on the Free plan
 * can exceed the CPU limit and show "Error 1102". This script makes that first
 * render happen here instead: it requests every server-rendered page (both
 * locales) and retries anything that comes back 5xx, so real visitors are served
 * from cache.
 */
const BASE = (process.argv[2] || 'https://stretch.vn').replace(/\/$/, '')
const LOCALES = ['', '/vi']
const CONCURRENCY = 3
const RETRIES = 4

async function json(path) {
  try {
    const res = await fetch(BASE + path, { signal: AbortSignal.timeout(30000) })
    return res.ok ? await res.json() : null
  } catch {
    return null
  }
}

async function hit(path) {
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const res = await fetch(BASE + path, { signal: AbortSignal.timeout(60000), headers: { 'user-agent': 'stretch-cache-warmer' } })
      await res.arrayBuffer()
      if (res.status < 500) return { path, status: res.status, attempt }
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 1500 * attempt))
  }
  return { path, status: 'FAILED', attempt: RETRIES }
}

const programs = (await json('/api/programs'))?.programs ?? []
const blog = await json('/api/posts?limit=100&published=true&summary=true')
const posts = Array.isArray(blog) ? blog : blog?.posts ?? blog?.data?.posts ?? []

const paths = []
for (const l of LOCALES) {
  paths.push(`${l}/learning-hub/programs`, `${l}/learning-hub/schedule`, `${l}/sharing-hub`)
  for (const p of programs) paths.push(`${l}/learning-hub/programs/${p.slug}`)
  for (const p of posts) if (p?.slug) paths.push(`${l}/sharing-hub/${p.slug}`)
}

console.log(`Warming ${paths.length} pages on ${BASE} (${programs.length} programmes, ${posts.length} posts)…`)
const results = []
for (let i = 0; i < paths.length; i += CONCURRENCY) {
  results.push(...(await Promise.all(paths.slice(i, i + CONCURRENCY).map(hit))))
}

const failed = results.filter((r) => r.status === 'FAILED' || r.status >= 500)
const retried = results.filter((r) => r.attempt > 1 && r.status !== 'FAILED')
console.log(`Done: ${results.length - failed.length}/${results.length} warm, ${retried.length} needed a retry.`)
for (const r of failed) console.log(`  FAILED ${r.path}`)
process.exit(failed.length ? 1 : 0)
