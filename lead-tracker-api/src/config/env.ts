import dotenv from 'dotenv'
dotenv.config()

export const env = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',

  /** Supabase / Render injects DATABASE_URL automatically. Fallback to individual vars for local dev. */
  databaseUrl: process.env.DATABASE_URL || undefined,

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lead_tracker',
    ssl: process.env.DB_SSL === 'true',
  },

  /** Supabase-specific (optional — for future Supabase client SDK usage) */
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
  },

  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim()),

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '60', 10),
  },

  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production-stretch-crm',

  admin: {
    email: (process.env.ADMIN_EMAIL || 'admin@stretch.vn').toLowerCase().trim(),
    password: process.env.ADMIN_PASSWORD || 'Admin@stretch1',
    name: process.env.ADMIN_NAME || 'Stretch Admin',
  },

  ga: {
    propertyId: process.env.GA_PROPERTY_ID || '',
    clientEmail: process.env.GA_CLIENT_EMAIL || '',
    privateKey: (process.env.GA_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  },

  /**
   * Google Search Console (Search Analytics API). Uses the SAME Google service
   * account as GA4 by default — just add that service-account email as a user on
   * the GSC property and enable the Search Console API in the GCP project.
   * `siteUrl` for a Domain property must be `sc-domain:<domain>` (NOT https://…).
   */
  gsc: {
    siteUrl: process.env.GSC_SITE_URL || 'sc-domain:stretch.vn',
    clientEmail: process.env.GSC_CLIENT_EMAIL || process.env.GA_CLIENT_EMAIL || '',
    privateKey: (process.env.GSC_PRIVATE_KEY || process.env.GA_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  },

  /** Cloudflare R2 (S3-compatible object storage) — image uploads */
  r2: {
    /** Cloudflare account id (the 32-char hex in the dashboard URL) */
    accountId: process.env.R2_ACCOUNT_ID || '',
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    bucket: process.env.R2_BUCKET || '',
    /**
     * Public base URL for serving objects — either the bucket's r2.dev URL
     * (https://pub-<hash>.r2.dev) or a connected custom domain (https://cdn.example.com).
     * No trailing slash.
     */
    publicBaseUrl: (process.env.R2_PUBLIC_BASE_URL || '').replace(/\/$/, ''),
    /** Key prefix/folder for uploads (default: blog) */
    prefix: process.env.R2_PREFIX || 'blog',
    /** Max upload size in bytes (default 10MB) */
    maxUploadBytes: parseInt(process.env.R2_MAX_BYTES || '10485760', 10),
    /** Resize images wider than this before storing (px). Set 0 to disable. */
    imageMaxWidth: parseInt(process.env.R2_IMAGE_MAX_WIDTH || '1920', 10),
    /** WebP re-encode quality (1–100) */
    imageQuality: parseInt(process.env.R2_IMAGE_QUALITY || '82', 10),
  },
} as const

// Default fallbacks that MUST NOT be used in production.
const DEFAULT_JWT_SECRET = 'change-me-in-production-stretch-crm'
const DEFAULT_ADMIN_PASSWORD = 'Admin@stretch1'

/**
 * Fail-fast in production if security-critical secrets are missing or left at defaults.
 * Called from the server entrypoint so the process refuses to start misconfigured.
 */
export function assertSecretsConfigured(): void {
  if (!env.isProd) return

  const problems: string[] = []
  if (!process.env.JWT_SECRET || env.jwtSecret === DEFAULT_JWT_SECRET) {
    problems.push('JWT_SECRET is missing or still the default value')
  } else if (env.jwtSecret.length < 16) {
    problems.push('JWT_SECRET is too short (use ≥ 16 random characters)')
  }
  if (!process.env.ADMIN_PASSWORD || env.admin.password === DEFAULT_ADMIN_PASSWORD) {
    problems.push('ADMIN_PASSWORD is missing or still the default value')
  }

  if (problems.length) {
    throw new Error(
      `Refusing to start in production with insecure config:\n  - ${problems.join('\n  - ')}`
    )
  }
}
