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
    /** Anonymous callers: the public site, and anyone who finds the URL. */
    max: parseInt(process.env.RATE_LIMIT_MAX || '60', 10),
    /**
     * Callers presenting a token. Much higher because an admin console screen
     * legitimately loads several collections, and a person clicking through it
     * is not abuse — at 60/min the ninth screen rendered a rate-limit error.
     */
    authenticatedMax: parseInt(process.env.RATE_LIMIT_AUTH_MAX || '1200', 10),
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

  /**
   * Google Calendar — where an accepted 1-to-1 mentorship session lands.
   *
   * Same service account as GA4/GSC by default. Two things must be done once in
   * Google Cloud / Calendar for this to work:
   *   1. Enable the Google Calendar API in the GCP project.
   *   2. Share the calendar (`calendarId`) with the service-account email,
   *      granting "Make changes to events".
   *
   * `impersonateSubject` turns on domain-wide delegation: the service account
   * then acts AS that user. It is the only way to get an auto-generated Google
   * Meet link and to have Google email the invitation, and it requires Google
   * Workspace. Left empty, events are still created — just without a Meet link,
   * which the console lets an admin paste in by hand instead.
   */
  gcal: {
    calendarId: process.env.GCAL_CALENDAR_ID || 'admin@stretch.vn',
    clientEmail: process.env.GCAL_CLIENT_EMAIL || process.env.GA_CLIENT_EMAIL || '',
    privateKey: (process.env.GCAL_PRIVATE_KEY || process.env.GA_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    /** Workspace user to act as. Empty = no delegation, no Meet link. */
    impersonateSubject: process.env.GCAL_IMPERSONATE_SUBJECT || '',
    /** Vietnam has no DST, so a fixed offset is correct year-round. */
    timezone: process.env.GCAL_TIMEZONE || 'Asia/Ho_Chi_Minh',
    utcOffset: process.env.GCAL_UTC_OFFSET || '+07:00',
  },

  /** 1-to-1 mentorship booking rules. */
  mentorship: {
    /** Length of one session, minutes. Must divide the opening hours evenly. */
    slotMinutes: parseInt(process.env.MENTORSHIP_SLOT_MINUTES || '30', 10),
    /** How far ahead a learner may book. */
    bookAheadDays: parseInt(process.env.MENTORSHIP_BOOK_AHEAD_DAYS || '14', 10),
    /** Reject slots starting sooner than this from now. */
    leadTimeHours: parseInt(process.env.MENTORSHIP_LEAD_TIME_HOURS || '12', 10),
    /** Cap on open requests one learner may have at once. */
    maxPendingPerLearner: parseInt(process.env.MENTORSHIP_MAX_PENDING || '2', 10),
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

  /**
   * Lesson videos in R2.
   *
   * Uploads never pass through this API: the browser PUTs parts straight to R2
   * with presigned URLs, so a 1.5 GB lecture does not touch Render's request
   * limits. Playback is a short-lived presigned GET — the video bucket must NOT
   * be public, or the signing is pointless.
   */
  video: {
    /**
     * Bucket for lecture videos. Defaults to the image bucket for convenience,
     * but they should NOT be the same one in production: the image bucket is
     * served publicly through R2_PUBLIC_BASE_URL, and a public bucket makes the
     * signed playback URLs pointless — anyone with the key reads the file.
     */
    bucket: process.env.R2_VIDEO_BUCKET || process.env.R2_BUCKET || '',
    /** Key prefix for lesson videos (default: lessons) */
    prefix: (process.env.R2_VIDEO_PREFIX || 'lessons').replace(/\/$/, ''),
    /** Reject uploads bigger than this (default 3 GB) */
    maxUploadBytes: parseInt(process.env.R2_VIDEO_MAX_BYTES || String(3 * 1024 * 1024 * 1024), 10),
    /** Multipart part size (default 16 MB; R2 requires >= 5 MB except the last part) */
    partSizeBytes: parseInt(process.env.R2_VIDEO_PART_SIZE || String(16 * 1024 * 1024), 10),
    /** How many presigned part URLs one upload may hand out */
    maxParts: parseInt(process.env.R2_VIDEO_MAX_PARTS || '400', 10),
    /** Lifetime of a presigned part URL, seconds (default 2h — big files are slow) */
    uploadUrlTtl: parseInt(process.env.R2_VIDEO_UPLOAD_TTL || '7200', 10),
    /** Lifetime of a playback URL, seconds (default 30 min) */
    playbackUrlTtl: parseInt(process.env.R2_VIDEO_PLAYBACK_TTL || '1800', 10),
  },

  /**
   * Shared secret the website's server routes send as `x-service-token` when
   * they ask for a playback URL on a learner's behalf. The learner session lives
   * on the site, not here, so this is what lets the site vouch for it.
   */
  siteServiceToken: process.env.SITE_SERVICE_TOKEN || '',

  /** Public base URL of the website — used to link back from a calendar event. */
  siteBaseUrl: (process.env.SITE_BASE_URL || 'https://stretch.vn').replace(/\/$/, ''),
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
