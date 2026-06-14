import app from './src/app'
import { env, assertSecretsConfigured } from './src/config/env'
import { testConnection } from './src/config/db'

async function start(): Promise<void> {
  console.log(`[Server] Environment: ${env.nodeEnv}`)

  // Refuse to boot in production with default/missing secrets.
  assertSecretsConfigured()

  const dbOk = await testConnection()
  if (!dbOk) {
    console.warn('[Server] ⚠ Starting without database — API calls requiring DB will fail')
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
