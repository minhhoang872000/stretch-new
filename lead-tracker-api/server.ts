import app from './src/app'
import { env, assertSecretsConfigured } from './src/config/env'
import { testConnection } from './src/config/db'
import { applySchema } from './src/config/schema'

/**
 * Whether to replay schema.sql before listening.
 *
 * On by default in production, because the host deploys on push and nothing
 * else runs between "new code" and "first request" — a missing column would
 * otherwise surface as a 500 to the first learner who signs in. Off by default
 * in development, where `tsx watch` restarts on every save and the developer
 * runs `npm run db:migrate` when they mean it. MIGRATE_ON_START=true|false
 * overrides either way.
 */
function shouldMigrateOnStart(): boolean {
  const flag = process.env.MIGRATE_ON_START
  if (flag === 'true') return true
  if (flag === 'false') return false
  return env.isProd
}

async function start(): Promise<void> {
  console.log(`[Server] Environment: ${env.nodeEnv}`)

  // Refuse to boot in production with default/missing secrets.
  assertSecretsConfigured()

  const dbOk = await testConnection()
  if (!dbOk) {
    console.warn('[Server] ⚠ Starting without database — API calls requiring DB will fail')
  }

  if (dbOk && shouldMigrateOnStart()) {
    // Non-fatal on purpose: a schema hiccup must not take the whole API down
    // with it — the routes whose tables already exist keep serving.
    try {
      const n = await applySchema()
      console.log(`[Server] ✓ schema.sql applied — ${n} tables`)
    } catch (err: any) {
      console.error('[Server] ✗ schema.sql failed (continuing):', err?.message || err)
    }
  }

  app.listen(env.port, () => {
    console.log(`[Server] ✓ Lead Tracker API running on port ${env.port}`)
    console.log(`[Server] ✓ Health check: http://localhost:${env.port}/health`)
  })
}

start().catch((err) => {
  console.error('[Server] Fatal error during startup:', err)
  process.exit(1)
})
