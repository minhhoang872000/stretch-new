#!/usr/bin/env node
/**
 * Build, deploy and warm stretch.vn in one go:
 *
 *   npm run deploy:prod
 *
 * 1. Wakes the Render API (free tier sleeps) so the prerender bakes live data.
 * 2. `nuxt build` with the PRODUCTION API base — `.env` points at localhost for
 *    development, and a build that reads it bakes the fallback catalogue.
 * 3. Deploys `dist` to the `stretch` Pages project (production branch).
 * 4. Warms the KV page cache (scripts/warm-cache.mjs) so no visitor pays for a
 *    cold render right after the deploy ("Error 1102" on the Free plan).
 */
import { spawnSync } from 'node:child_process'

const API = process.env.NUXT_LESSON_API_BASE || 'https://stretch-new.onrender.com/api/v1'
const SITE = process.env.NUXT_PUBLIC_SITE_URL || 'https://stretch.vn'
// A Nuxt + prerender build peaks at several GB; on a busy machine Node was
// aborted mid-build (exit 134). Give it room.
const env = {
  ...process.env,
  NUXT_LESSON_API_BASE: API,
  NUXT_PUBLIC_SITE_URL: SITE,
  NODE_OPTIONS: `${process.env.NODE_OPTIONS || ''} --max-old-space-size=6144`.trim(),
}

function run(label, cmd, args) {
  console.log(`\n▶ ${label}`)
  const r = spawnSync(cmd, args, { stdio: 'inherit', env, shell: process.platform === 'win32' })
  if (r.status !== 0) {
    console.error(`✗ ${label} failed (exit ${r.status})`)
    process.exit(r.status || 1)
  }
}

console.log(`▶ Waking the API at ${API}`)
for (let i = 0; i < 3; i++) {
  try {
    const res = await fetch(`${API}/programs?limit=1`, { signal: AbortSignal.timeout(60000) })
    if (res.ok) break
  } catch {
    /* sleeping — try again */
  }
}

run('Build', 'npx', ['nuxt', 'build'])
run('Deploy to Cloudflare Pages', 'npx', ['wrangler', 'pages', 'deploy', 'dist', '--project-name', 'stretch', '--branch', 'main', '--commit-dirty=true'])
// Give the new deployment a moment to become the production alias.
await new Promise((r) => setTimeout(r, 10000))
run('Warm the page cache', 'node', ['scripts/warm-cache.mjs', SITE])
console.log('\n✓ Deployed and warmed.')
