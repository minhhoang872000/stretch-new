-- ============================================================
-- Lead Tracker — PostgreSQL Schema
-- Run this once to create the tables.
-- ============================================================

-- ─── Admins ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS admins (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(200)  NOT NULL UNIQUE,
  name          VARCHAR(100)  NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  created_at    TIMESTAMPTZ   DEFAULT NOW()
);

-- ─── Lead Events (Tracking) ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lead_events (
  id              BIGSERIAL       PRIMARY KEY,
  session_id      VARCHAR(64)     NOT NULL,
  form_source     VARCHAR(100)    DEFAULT NULL,
  page_source     VARCHAR(200)    DEFAULT NULL,
  cta_clicked     VARCHAR(100)    DEFAULT NULL,
  service_interest VARCHAR(100)   DEFAULT NULL,
  utm_source      VARCHAR(100)    DEFAULT NULL,
  utm_medium      VARCHAR(100)    DEFAULT NULL,
  utm_campaign    VARCHAR(100)    DEFAULT NULL,
  utm_content     VARCHAR(100)    DEFAULT NULL,
  utm_term        VARCHAR(100)    DEFAULT NULL,
  referrer        VARCHAR(500)    DEFAULT NULL,
  device_type     VARCHAR(20)     DEFAULT NULL,
  ip_address      VARCHAR(45)     DEFAULT NULL,
  user_agent      VARCHAR(500)    DEFAULT NULL,
  ga4_client_id   VARCHAR(100)    DEFAULT NULL,
  meta_fbp        VARCHAR(100)    DEFAULT NULL,
  timestamp       TIMESTAMPTZ     NOT NULL,
  created_at      TIMESTAMPTZ     DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_le_session      ON lead_events (session_id);
CREATE INDEX IF NOT EXISTS idx_le_page_source  ON lead_events (page_source);
CREATE INDEX IF NOT EXISTS idx_le_created_at   ON lead_events (created_at);
CREATE INDEX IF NOT EXISTS idx_le_utm_source   ON lead_events (utm_source);
CREATE INDEX IF NOT EXISTS idx_le_utm_campaign ON lead_events (utm_campaign);

-- ─── Products / Services ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS products (
  id                    VARCHAR(20)   PRIMARY KEY,
  slug                  VARCHAR(100)  NOT NULL UNIQUE,
  name                  VARCHAR(200)  NOT NULL,
  name_en               VARCHAR(200)  NOT NULL,
  name_vi               VARCHAR(200)  NOT NULL,
  short_description     VARCHAR(500)  NOT NULL,
  short_description_en  VARCHAR(500)  NOT NULL,
  short_description_vi  VARCHAR(500)  NOT NULL,
  description           TEXT          NOT NULL,
  price                 INTEGER       NOT NULL DEFAULT 0,
  currency              VARCHAR(10)   NOT NULL DEFAULT 'VND',
  cover_image           VARCHAR(500)  DEFAULT NULL,
  images                JSONB         DEFAULT NULL,
  category              VARCHAR(50)   DEFAULT NULL,
  tags                  JSONB         DEFAULT NULL,
  available             BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ   DEFAULT NOW(),
  updated_at            TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prod_category  ON products (category);
CREATE INDEX IF NOT EXISTS idx_prod_available ON products (available);

-- ─── Practitioners ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS practitioners (
  id            VARCHAR(20)   PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  avatar        VARCHAR(500)  DEFAULT NULL,
  bio           TEXT          DEFAULT NULL,
  specialties   JSONB         DEFAULT NULL,
  services      JSONB         DEFAULT NULL
);

-- ─── Practitioner ↔ Service (many-to-many) ───────────────────────────

CREATE TABLE IF NOT EXISTS practitioner_services (
  practitioner_id VARCHAR(20) NOT NULL,
  service_id      VARCHAR(20) NOT NULL,
  PRIMARY KEY (practitioner_id, service_id),
  FOREIGN KEY (practitioner_id) REFERENCES practitioners(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ─── Bookings ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bookings (
  id            VARCHAR(30)   PRIMARY KEY,
  service       VARCHAR(20)   NOT NULL,
  practitioner  VARCHAR(20)   DEFAULT NULL,
  date          VARCHAR(10)   NOT NULL,      -- YYYY-MM-DD
  time          VARCHAR(20)   NOT NULL,      -- HH:mm or flexible
  name          VARCHAR(200)  NOT NULL,
  phone         VARCHAR(20)   NOT NULL,
  email         VARCHAR(200)  DEFAULT NULL,
  note          TEXT          DEFAULT NULL,
  session_id    VARCHAR(64)   DEFAULT NULL,  -- Links booking to lead_events.session_id
  status        VARCHAR(20)   NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at    TIMESTAMPTZ   DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_bk_status     ON bookings (status);
CREATE INDEX IF NOT EXISTS idx_bk_date       ON bookings (date);
CREATE INDEX IF NOT EXISTS idx_bk_service    ON bookings (service);
CREATE INDEX IF NOT EXISTS idx_bk_created_at ON bookings (created_at);
CREATE INDEX IF NOT EXISTS idx_bk_session    ON bookings (session_id);

-- ─── Categories (Blog content categories) ───────────────────────────

CREATE TABLE IF NOT EXISTS categories (
  id            VARCHAR(30)   PRIMARY KEY,
  key           VARCHAR(60)   NOT NULL UNIQUE,
  label         VARCHAR(120)  NOT NULL,
  description   VARCHAR(300)  DEFAULT NULL,
  icon          VARCHAR(60)   NOT NULL DEFAULT 'category',
  icon_bg       VARCHAR(60)   NOT NULL DEFAULT 'bg-teal-50',
  icon_color    VARCHAR(60)   NOT NULL DEFAULT 'text-teal-600',
  sort_order    INTEGER       NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ   DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cat_key  ON categories (key);
CREATE INDEX IF NOT EXISTS idx_cat_sort ON categories (sort_order);

-- ─── Blog Posts ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS blog_posts (
  id            VARCHAR(30)   PRIMARY KEY,
  slug          VARCHAR(200)  NOT NULL UNIQUE,
  title_en      VARCHAR(500)  NOT NULL,
  title_vi      VARCHAR(500)  NOT NULL,
  excerpt_en    TEXT          DEFAULT NULL,
  excerpt_vi    TEXT          DEFAULT NULL,
  content_en    JSONB         DEFAULT '[]',   -- Array of section objects
  content_vi    JSONB         DEFAULT '[]',   -- Array of section objects
  -- Category key references the dynamic `categories` table — no fixed CHECK list.
  category      VARCHAR(60)   NOT NULL,
  tags          JSONB         DEFAULT '[]',
  cover_image   VARCHAR(500)  DEFAULT NULL,
  author        VARCHAR(200)  DEFAULT 'Stretch Team',
  read_time     VARCHAR(20)   DEFAULT NULL,
  featured      BOOLEAN       NOT NULL DEFAULT FALSE,
  published     BOOLEAN       NOT NULL DEFAULT TRUE,
  published_at  TIMESTAMPTZ   DEFAULT NOW(),
  created_at    TIMESTAMPTZ   DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   DEFAULT NOW()
);

-- Drop the legacy fixed-category CHECK on databases created before categories went dynamic.
ALTER TABLE blog_posts DROP CONSTRAINT IF EXISTS blog_posts_category_check;

CREATE INDEX IF NOT EXISTS idx_bp_slug        ON blog_posts (slug);
CREATE INDEX IF NOT EXISTS idx_bp_category    ON blog_posts (category);
CREATE INDEX IF NOT EXISTS idx_bp_featured    ON blog_posts (featured);
CREATE INDEX IF NOT EXISTS idx_bp_published   ON blog_posts (published);
CREATE INDEX IF NOT EXISTS idx_bp_published_at ON blog_posts (published_at);
-- Composite index matching the list query (WHERE published ... ORDER BY featured DESC, published_at DESC).
CREATE INDEX IF NOT EXISTS idx_bp_list        ON blog_posts (published, featured, published_at DESC);

-- Speeds up the leads list device_type filter.
CREATE INDEX IF NOT EXISTS idx_le_device      ON lead_events (device_type);

-- ─── Lesson Videos (Cloudflare R2) ───────────────────────────────────
-- One row per uploaded lecture video. The bytes live in R2 under
-- `<R2_VIDEO_PREFIX>/<id>/source.<ext>`; this table is the index the console and
-- the website read. `status` is 'uploading' until the browser finishes the
-- multipart upload, so an abandoned upload is visible instead of invisible.

CREATE TABLE IF NOT EXISTS lesson_videos (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  object_key       VARCHAR(1024) NOT NULL UNIQUE,
  title            VARCHAR(300)  NOT NULL DEFAULT '',
  -- Which lesson slot this plays in. NULL = in the library, not bound yet.
  program_slug     VARCHAR(200)  DEFAULT NULL,
  lesson_ordinal   INTEGER       DEFAULT NULL,
  content_type     VARCHAR(100)  NOT NULL,
  size_bytes       BIGINT        NOT NULL DEFAULT 0,
  duration_seconds INTEGER       DEFAULT NULL,
  status           VARCHAR(20)   NOT NULL DEFAULT 'uploading',
  -- Open multipart upload id; cleared on completion.
  upload_id        VARCHAR(500)  DEFAULT NULL,
  created_by       VARCHAR(200)  DEFAULT NULL,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- The website's hot path: "video for lesson N of this course".
CREATE INDEX IF NOT EXISTS idx_lv_lesson  ON lesson_videos (program_slug, lesson_ordinal);
CREATE INDEX IF NOT EXISTS idx_lv_status  ON lesson_videos (status);
CREATE INDEX IF NOT EXISTS idx_lv_created ON lesson_videos (created_at DESC);

-- ─── Mentorship: 1-to-1 sessions with an instructor ──────────────────
-- A learner watching a lesson asks for a call; the console accepts it and the
-- session lands on the academy's Google Calendar.
--
-- Opening hours live here, but they are only half of what a learner is offered:
-- the API subtracts what Google Calendar reports as busy, so anything already on
-- that calendar — booked here or typed in by hand — closes the slot.

CREATE TABLE IF NOT EXISTS mentorship_hours (
  id            SERIAL        PRIMARY KEY,
  -- 0 = Sunday, matching JavaScript's Date#getDay().
  weekday       SMALLINT      NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time    VARCHAR(5)    NOT NULL,      -- HH:mm
  end_time      VARCHAR(5)    NOT NULL,      -- HH:mm, exclusive
  active        BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  -- One window per weekday keeps the console's 7-row editor honest.
  UNIQUE (weekday)
);

CREATE TABLE IF NOT EXISTS mentorship_sessions (
  id               VARCHAR(30)   PRIMARY KEY,
  -- Where the learner was standing when they asked. `lesson_key` is the
  -- player's own "<module>-<item>" key, so the console can link straight back.
  program_slug     VARCHAR(200)  DEFAULT NULL,
  lesson_key       VARCHAR(20)   DEFAULT NULL,
  lesson_title     VARCHAR(300)  DEFAULT NULL,
  -- Identity comes from the site's Google session, never from the request body.
  learner_name     VARCHAR(200)  NOT NULL,
  learner_email    VARCHAR(200)  NOT NULL,
  learner_avatar   VARCHAR(500)  DEFAULT NULL,
  topic            TEXT          DEFAULT NULL,
  date             VARCHAR(10)   NOT NULL,   -- YYYY-MM-DD
  time             VARCHAR(5)    NOT NULL,   -- HH:mm
  duration_minutes SMALLINT      NOT NULL DEFAULT 30,
  status           VARCHAR(20)   NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled', 'completed')),
  -- Set once accepted. `meet_url` may be pasted by hand when the service
  -- account cannot mint one (no domain-wide delegation).
  google_event_id  VARCHAR(300)  DEFAULT NULL,
  google_html_link VARCHAR(500)  DEFAULT NULL,
  meet_url         VARCHAR(500)  DEFAULT NULL,
  decline_reason   TEXT          DEFAULT NULL,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ms_status  ON mentorship_sessions (status);
CREATE INDEX IF NOT EXISTS idx_ms_date    ON mentorship_sessions (date);
CREATE INDEX IF NOT EXISTS idx_ms_learner ON mentorship_sessions (learner_email, status);
CREATE INDEX IF NOT EXISTS idx_ms_created ON mentorship_sessions (created_at DESC);

-- Two learners must not hold the same slot. Declined/cancelled rows are excluded
-- so a refused request does not block the time forever.
CREATE UNIQUE INDEX IF NOT EXISTS idx_ms_slot_taken
  ON mentorship_sessions (date, time)
  WHERE status IN ('pending', 'accepted', 'completed');

-- Sensible starting hours: weekday afternoons. Safe to re-run.
INSERT INTO mentorship_hours (weekday, start_time, end_time, active) VALUES
  (1, '14:00', '17:00', TRUE),
  (2, '14:00', '17:00', TRUE),
  (3, '14:00', '17:00', TRUE),
  (4, '14:00', '17:00', TRUE),
  (5, '14:00', '17:00', TRUE)
ON CONFLICT (weekday) DO NOTHING;

-- ════════════════════════════════════════════════════════════════════
-- ACADEMY — the Learning Hub tables behind instructor-admin,
-- restorative-crm/academy and the site's course pages.
--
-- Denormalised display names (program_title, learner_name) are deliberate:
-- every console table shows them and all three frontends already expect the
-- field. The write paths fill them from the parent row, so they cannot drift.
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS instructors (
  id           VARCHAR(30)   PRIMARY KEY,
  name         VARCHAR(120)  NOT NULL,
  role         VARCHAR(120)  DEFAULT '',
  email        VARCHAR(200)  DEFAULT '',
  phone        VARCHAR(40)   DEFAULT '',
  bio          TEXT          DEFAULT '',
  specialties  JSONB         NOT NULL DEFAULT '[]',
  programs     INTEGER       NOT NULL DEFAULT 0,
  learners     INTEGER       NOT NULL DEFAULT 0,
  rating       NUMERIC(2,1)  NOT NULL DEFAULT 0,
  status       VARCHAR(20)   NOT NULL DEFAULT 'active',
  joined_at    DATE          DEFAULT NULL,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ins_status ON instructors (status);

-- The syllabus lives in `modules` as JSONB rather than in two more tables.
-- It is always read and written whole: the console edits a programme outline as
-- one document, and no query asks for "all lessons across programmes" except
-- the video index, which has its own table already.
CREATE TABLE IF NOT EXISTS programs (
  id               VARCHAR(30)   PRIMARY KEY,
  slug             VARCHAR(200)  NOT NULL UNIQUE,
  title            VARCHAR(300)  NOT NULL,
  subtitle         VARCHAR(500)  DEFAULT '',
  kind             VARCHAR(20)   NOT NULL DEFAULT 'course',
  mode             VARCHAR(20)   NOT NULL DEFAULT 'online',
  topic            VARCHAR(40)   DEFAULT NULL,
  level            VARCHAR(80)   DEFAULT '',
  language         VARCHAR(40)   NOT NULL DEFAULT 'vi',
  price            INTEGER       NOT NULL DEFAULT 0,
  compare_at_price INTEGER       DEFAULT NULL,
  status           VARCHAR(20)   NOT NULL DEFAULT 'draft',
  badge            VARCHAR(60)   DEFAULT NULL,
  certificate      BOOLEAN       NOT NULL DEFAULT FALSE,
  instructor_id    VARCHAR(30)   DEFAULT NULL REFERENCES instructors(id) ON DELETE SET NULL,
  image            VARCHAR(500)  DEFAULT '',
  outcomes         JSONB         NOT NULL DEFAULT '[]',
  skills           JSONB         NOT NULL DEFAULT '[]',
  modules          JSONB         NOT NULL DEFAULT '[]',
  faq              JSONB         NOT NULL DEFAULT '[]',
  seo              JSONB         NOT NULL DEFAULT '{}',
  lessons          INTEGER       NOT NULL DEFAULT 0,
  minutes          INTEGER       NOT NULL DEFAULT 0,
  enrolled         INTEGER       NOT NULL DEFAULT 0,
  rating           NUMERIC(2,1)  NOT NULL DEFAULT 0,
  review_count     INTEGER       NOT NULL DEFAULT 0,
  revenue          BIGINT        NOT NULL DEFAULT 0,
  published_at     DATE          DEFAULT NULL,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prg_status ON programs (status);
CREATE INDEX IF NOT EXISTS idx_prg_topic  ON programs (topic);

-- A dated occurrence of a programme: a workshop, or a live online class.
-- Named `program_sessions`, never `sessions`, so a log line or a query can
-- never be misread as being about a login session.
CREATE TABLE IF NOT EXISTS program_sessions (
  id            VARCHAR(30)   PRIMARY KEY,
  program_id    VARCHAR(30)   NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  program_title VARCHAR(300)  NOT NULL DEFAULT '',
  kind          VARCHAR(20)   DEFAULT NULL,
  mode          VARCHAR(20)   DEFAULT NULL,
  date          DATE          NOT NULL,
  time          VARCHAR(40)   NOT NULL DEFAULT '',
  location      VARCHAR(300)  DEFAULT '',
  instructor_id VARCHAR(30)   DEFAULT NULL REFERENCES instructors(id) ON DELETE SET NULL,
  capacity      INTEGER       NOT NULL DEFAULT 0,
  booked        INTEGER       NOT NULL DEFAULT 0,
  note          TEXT          DEFAULT '',
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pses_date    ON program_sessions (date);
CREATE INDEX IF NOT EXISTS idx_pses_program ON program_sessions (program_id);

CREATE TABLE IF NOT EXISTS learners (
  id             VARCHAR(30)   PRIMARY KEY,
  name           VARCHAR(120)  NOT NULL,
  initials       VARCHAR(8)    DEFAULT '',
  email          VARCHAR(200)  NOT NULL,
  phone          VARCHAR(40)   DEFAULT '',
  city           VARCHAR(80)   DEFAULT '',
  job            VARCHAR(120)  DEFAULT '',
  source         VARCHAR(80)   DEFAULT '',
  google         BOOLEAN       NOT NULL DEFAULT FALSE,
  joined_at      DATE          DEFAULT NULL,
  last_active_at TIMESTAMPTZ   DEFAULT NULL,
  status         VARCHAR(20)   NOT NULL DEFAULT 'active',
  note           TEXT          DEFAULT '',
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lrn_status ON learners (status);
CREATE INDEX IF NOT EXISTS idx_lrn_email  ON learners (email);

CREATE TABLE IF NOT EXISTS enrolments (
  id             VARCHAR(30)   PRIMARY KEY,
  learner_id     VARCHAR(30)   NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  learner_name   VARCHAR(120)  NOT NULL DEFAULT '',
  program_id     VARCHAR(30)   NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  program_title  VARCHAR(300)  NOT NULL DEFAULT '',
  mode           VARCHAR(20)   DEFAULT NULL,
  status         VARCHAR(20)   NOT NULL DEFAULT 'active',
  percent        INTEGER       NOT NULL DEFAULT 0,
  lessons_done   INTEGER       NOT NULL DEFAULT 0,
  lessons        INTEGER       NOT NULL DEFAULT 0,
  source         VARCHAR(20)   NOT NULL DEFAULT 'manual',
  started_at     DATE          DEFAULT NULL,
  last_lesson_at TIMESTAMPTZ   DEFAULT NULL,
  completed_at   DATE          DEFAULT NULL,
  quiz_avg       INTEGER       DEFAULT NULL,
  note           TEXT          DEFAULT '',
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  -- One learner cannot hold the same programme twice; re-granting revives the row.
  UNIQUE (learner_id, program_id)
);

CREATE INDEX IF NOT EXISTS idx_enr_learner ON enrolments (learner_id);
CREATE INDEX IF NOT EXISTS idx_enr_program ON enrolments (program_id);
CREATE INDEX IF NOT EXISTS idx_enr_status  ON enrolments (status);

CREATE TABLE IF NOT EXISTS certificates (
  id            VARCHAR(30)   PRIMARY KEY,
  code          VARCHAR(40)   NOT NULL UNIQUE,
  enrolment_id  VARCHAR(30)   DEFAULT NULL REFERENCES enrolments(id) ON DELETE SET NULL,
  learner_id    VARCHAR(30)   NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  learner_name  VARCHAR(120)  NOT NULL DEFAULT '',
  program_id    VARCHAR(30)   NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  program_title VARCHAR(300)  NOT NULL DEFAULT '',
  issued_at     DATE          NOT NULL,
  score         INTEGER       DEFAULT NULL,
  status        VARCHAR(20)   NOT NULL DEFAULT 'valid',
  signed_by     VARCHAR(120)  DEFAULT '',
  revoked_at    DATE          DEFAULT NULL,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crt_code    ON certificates (code);
CREATE INDEX IF NOT EXISTS idx_crt_learner ON certificates (learner_id);

CREATE TABLE IF NOT EXISTS program_reviews (
  id            VARCHAR(30)   PRIMARY KEY,
  program_id    VARCHAR(30)   NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  program_title VARCHAR(300)  NOT NULL DEFAULT '',
  learner_id    VARCHAR(30)   DEFAULT NULL REFERENCES learners(id) ON DELETE SET NULL,
  learner_name  VARCHAR(120)  NOT NULL DEFAULT '',
  rating        INTEGER       NOT NULL DEFAULT 5,
  text          TEXT          DEFAULT '',
  reply         TEXT          DEFAULT '',
  -- 'pending' until an instructor approves it; the site only reads 'approved'.
  status        VARCHAR(20)   NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rev_program ON program_reviews (program_id);
CREATE INDEX IF NOT EXISTS idx_rev_status  ON program_reviews (status);

-- One row per learner per lesson. The drop-off report is a GROUP BY over this,
-- not a stored rollup — a rollup is a number that was true once.
CREATE TABLE IF NOT EXISTS lesson_progress (
  id               VARCHAR(40)   PRIMARY KEY,
  learner_id       VARCHAR(30)   NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  program_id       VARCHAR(30)   NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  module_index     INTEGER       NOT NULL DEFAULT 0,
  item_index       INTEGER       NOT NULL DEFAULT 0,
  -- Index among VIDEO lessons only — the same ordinal playback is addressed by.
  ordinal          INTEGER       DEFAULT NULL,
  lesson_title     VARCHAR(300)  DEFAULT '',
  watched_seconds  INTEGER       NOT NULL DEFAULT 0,
  duration_seconds INTEGER       NOT NULL DEFAULT 0,
  completed_at     TIMESTAMPTZ   DEFAULT NULL,
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (learner_id, program_id, module_index, item_index)
);

CREATE INDEX IF NOT EXISTS idx_lp_program ON lesson_progress (program_id);
CREATE INDEX IF NOT EXISTS idx_lp_learner ON lesson_progress (learner_id);

-- Individual quiz answers, so "most-missed question" is a measurement.
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id           VARCHAR(40)   PRIMARY KEY,
  learner_id   VARCHAR(30)   NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  program_id   VARCHAR(30)   NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  module_index INTEGER       NOT NULL DEFAULT 0,
  item_index   INTEGER       NOT NULL DEFAULT 0,
  question     TEXT          NOT NULL,
  correct      BOOLEAN       NOT NULL DEFAULT FALSE,
  attempted_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qa_program ON quiz_attempts (program_id);

-- ════════════════════════════════════════════════════════════════════
-- SALES
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS coupons (
  id         VARCHAR(30)  PRIMARY KEY,
  code       VARCHAR(40)  NOT NULL UNIQUE,
  type       VARCHAR(20)  NOT NULL DEFAULT 'percent',  -- percent | amount
  value      INTEGER      NOT NULL DEFAULT 0,
  scope      VARCHAR(40)  NOT NULL DEFAULT 'all',
  min_spend  INTEGER      NOT NULL DEFAULT 0,
  quota      INTEGER      NOT NULL DEFAULT 0,          -- 0 = unlimited
  used       INTEGER      NOT NULL DEFAULT 0,
  starts_at  DATE         DEFAULT NULL,
  ends_at    DATE         DEFAULT NULL,
  status     VARCHAR(20)  NOT NULL DEFAULT 'active',
  note       TEXT         DEFAULT '',
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cpn_code   ON coupons (code);
CREATE INDEX IF NOT EXISTS idx_cpn_status ON coupons (status);

CREATE TABLE IF NOT EXISTS orders (
  id            VARCHAR(30)   PRIMARY KEY,
  code          VARCHAR(40)   NOT NULL UNIQUE,
  learner_id    VARCHAR(30)   DEFAULT NULL REFERENCES learners(id) ON DELETE SET NULL,
  customer      VARCHAR(120)  NOT NULL DEFAULT '',
  email         VARCHAR(200)  DEFAULT '',
  phone         VARCHAR(40)   DEFAULT '',
  program_id    VARCHAR(30)   DEFAULT NULL REFERENCES programs(id) ON DELETE SET NULL,
  program_title VARCHAR(300)  DEFAULT '',
  quantity      INTEGER       NOT NULL DEFAULT 1,
  subtotal      INTEGER       NOT NULL DEFAULT 0,
  coupon_code   VARCHAR(40)   DEFAULT NULL,
  discount      INTEGER       NOT NULL DEFAULT 0,
  total         INTEGER       NOT NULL DEFAULT 0,
  method        VARCHAR(20)   DEFAULT NULL,
  status        VARCHAR(20)   NOT NULL DEFAULT 'pending',
  -- Whether a paid order has been turned into an enrolment yet. False on a paid
  -- order is the entire reason the Orders screen exists.
  enrolled      BOOLEAN       NOT NULL DEFAULT FALSE,
  paid_at       TIMESTAMPTZ   DEFAULT NULL,
  note          TEXT          DEFAULT '',
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ord_status  ON orders (status);
CREATE INDEX IF NOT EXISTS idx_ord_created ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ord_learner ON orders (learner_id);

CREATE TABLE IF NOT EXISTS payments (
  id          VARCHAR(30)   PRIMARY KEY,
  order_id    VARCHAR(30)   DEFAULT NULL REFERENCES orders(id) ON DELETE SET NULL,
  order_code  VARCHAR(40)   DEFAULT '',
  customer    VARCHAR(120)  DEFAULT '',
  amount      INTEGER       NOT NULL DEFAULT 0,
  method      VARCHAR(20)   DEFAULT NULL,
  reference   VARCHAR(120)  DEFAULT '',
  status      VARCHAR(20)   NOT NULL DEFAULT 'pending',
  -- Matched against the bank statement by a person. Money is not software.
  reconciled  BOOLEAN       NOT NULL DEFAULT FALSE,
  received_at TIMESTAMPTZ   DEFAULT NULL,
  note        TEXT          DEFAULT '',
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pay_order  ON payments (order_id);
CREATE INDEX IF NOT EXISTS idx_pay_status ON payments (status);

-- ════════════════════════════════════════════════════════════════════
-- THERAPY — the studio side. `practitioners`, `products` (services) and
-- `bookings` already existed for the public site; these ALTERs add the columns
-- the console shows and the two tables the site never needed.
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE practitioners ADD COLUMN IF NOT EXISTS role         VARCHAR(120) DEFAULT '';
ALTER TABLE practitioners ADD COLUMN IF NOT EXISTS email        VARCHAR(200) DEFAULT '';
ALTER TABLE practitioners ADD COLUMN IF NOT EXISTS phone        VARCHAR(40)  DEFAULT '';
ALTER TABLE practitioners ADD COLUMN IF NOT EXISTS studio       VARCHAR(120) DEFAULT '';
ALTER TABLE practitioners ADD COLUMN IF NOT EXISTS weekly_hours INTEGER      NOT NULL DEFAULT 0;
ALTER TABLE practitioners ADD COLUMN IF NOT EXISTS rating       NUMERIC(2,1) NOT NULL DEFAULT 0;
ALTER TABLE practitioners ADD COLUMN IF NOT EXISTS sessions_30d INTEGER      NOT NULL DEFAULT 0;
ALTER TABLE practitioners ADD COLUMN IF NOT EXISTS status       VARCHAR(20)  NOT NULL DEFAULT 'active';
ALTER TABLE practitioners ADD COLUMN IF NOT EXISTS created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW();
ALTER TABLE practitioners ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW();

ALTER TABLE products ADD COLUMN IF NOT EXISTS description_en   TEXT         DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_vi   TEXT         DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS duration_minutes INTEGER      NOT NULL DEFAULT 60;
ALTER TABLE products ADD COLUMN IF NOT EXISTS bookings_30d     INTEGER      NOT NULL DEFAULT 0;
-- 'published' | 'hidden' — the vocabulary the console already uses for a
-- service. An earlier revision defaulted this to 'active', which meant the
-- table carried two words for one state and the public filter matched neither
-- consistently; the UPDATE below normalises any row left on the old value and
-- is a no-op on every run after the first.
ALTER TABLE products ADD COLUMN IF NOT EXISTS status           VARCHAR(20)  NOT NULL DEFAULT 'published';
ALTER TABLE products ALTER COLUMN status SET DEFAULT 'published';
UPDATE products SET status = 'published' WHERE status = 'active';
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo              JSONB        NOT NULL DEFAULT '{}';

-- The console's booking table carries more than the public form collects.
-- Every added column is nullable or defaulted, so the existing site flow —
-- which writes only the original columns — keeps working untouched.
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS code            VARCHAR(40)  DEFAULT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS initials        VARCHAR(8)   DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_name    VARCHAR(200) DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS practitioner_id VARCHAR(20)  DEFAULT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS studio          VARCHAR(120) DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS type            VARCHAR(30)  DEFAULT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS price           INTEGER      NOT NULL DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS source          VARCHAR(60)  DEFAULT '';

-- Recurring weekly opening hours, one row per practitioner per weekday.
CREATE TABLE IF NOT EXISTS practitioner_availability (
  id                VARCHAR(30)  PRIMARY KEY,
  practitioner_id   VARCHAR(20)  NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  practitioner_name VARCHAR(120) NOT NULL DEFAULT '',
  -- 0 = Sunday, matching JavaScript's Date#getDay so no frontend has to shift it.
  weekday           INTEGER      NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  studio            VARCHAR(120) DEFAULT '',
  open              BOOLEAN      NOT NULL DEFAULT TRUE,
  "from"            VARCHAR(10)  NOT NULL DEFAULT '09:00',
  "to"              VARCHAR(10)  NOT NULL DEFAULT '18:00',
  slot_minutes      INTEGER      NOT NULL DEFAULT 60,
  capacity_per_slot INTEGER      NOT NULL DEFAULT 1,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (practitioner_id, weekday)
);

CREATE INDEX IF NOT EXISTS idx_avail_prac ON practitioner_availability (practitioner_id);

-- Dated exceptions that beat the weekly pattern: leave, training, sick days.
CREATE TABLE IF NOT EXISTS practitioner_time_off (
  id                VARCHAR(30)  PRIMARY KEY,
  practitioner_id   VARCHAR(20)  NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  practitioner_name VARCHAR(120) NOT NULL DEFAULT '',
  "from"            DATE         NOT NULL,
  "to"              DATE         NOT NULL,
  reason            VARCHAR(300) DEFAULT '',
  status            VARCHAR(20)  NOT NULL DEFAULT 'approved',
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_timeoff_prac ON practitioner_time_off (practitioner_id);
CREATE INDEX IF NOT EXISTS idx_timeoff_from ON practitioner_time_off ("from");

-- ════════════════════════════════════════════════════════════════════
-- CONTENT
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS pages (
  id              VARCHAR(30)   PRIMARY KEY,
  path            VARCHAR(200)  NOT NULL UNIQUE,
  title_vi        VARCHAR(300)  NOT NULL DEFAULT '',
  title_en        VARCHAR(300)  NOT NULL DEFAULT '',
  section         VARCHAR(60)   DEFAULT '',
  status          VARCHAR(20)   NOT NULL DEFAULT 'draft',
  locales         JSONB         NOT NULL DEFAULT '[]',
  blocks          INTEGER       NOT NULL DEFAULT 0,
  words           INTEGER       NOT NULL DEFAULT 0,
  seo_title       VARCHAR(300)  DEFAULT '',
  seo_description VARCHAR(500)  DEFAULT '',
  note            TEXT          DEFAULT '',
  updated_by      VARCHAR(120)  DEFAULT '',
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pages_status ON pages (status);

CREATE TABLE IF NOT EXISTS faqs (
  id           VARCHAR(30)  PRIMARY KEY,
  "group"      VARCHAR(60)  NOT NULL DEFAULT 'general',
  question_vi  VARCHAR(500) NOT NULL DEFAULT '',
  answer_vi    TEXT         DEFAULT '',
  question_en  VARCHAR(500) DEFAULT '',
  answer_en    TEXT         DEFAULT '',
  status       VARCHAR(20)  NOT NULL DEFAULT 'published',
  sort_order   INTEGER      NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faq_group ON faqs ("group", sort_order);

CREATE TABLE IF NOT EXISTS translations (
  id         VARCHAR(30)  PRIMARY KEY,
  key        VARCHAR(200) NOT NULL,
  namespace  VARCHAR(60)  NOT NULL DEFAULT 'common',
  vi         TEXT         DEFAULT '',
  en         TEXT         DEFAULT '',
  -- 'ok' when both locales are filled; anything else is what the console lists.
  status     VARCHAR(20)  NOT NULL DEFAULT 'ok',
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (namespace, key)
);

CREATE INDEX IF NOT EXISTS idx_tr_status ON translations (status);

-- The image library the console browses. Distinct from `lesson_videos`: these
-- are public assets in the image bucket, addressed by URL, not by signed link.
CREATE TABLE IF NOT EXISTS media_assets (
  id          VARCHAR(30)   PRIMARY KEY,
  name        VARCHAR(300)  NOT NULL DEFAULT '',
  url         VARCHAR(500)  NOT NULL,
  thumb       VARCHAR(500)  DEFAULT '',
  kind        VARCHAR(20)   NOT NULL DEFAULT 'image',
  width       INTEGER       NOT NULL DEFAULT 0,
  height      INTEGER       NOT NULL DEFAULT 0,
  size_kb     INTEGER       NOT NULL DEFAULT 0,
  alt         VARCHAR(500)  DEFAULT '',
  used_in     JSONB         NOT NULL DEFAULT '[]',
  uploaded_by VARCHAR(120)  DEFAULT '',
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_kind ON media_assets (kind);

-- ════════════════════════════════════════════════════════════════════
-- CRM
-- ════════════════════════════════════════════════════════════════════

-- Corporate enquiries: a company asking about training for a team. Distinct
-- from `lead_events`, which is anonymous page-level tracking.
CREATE TABLE IF NOT EXISTS enquiries (
  id             VARCHAR(30)   PRIMARY KEY,
  company        VARCHAR(200)  NOT NULL,
  company_size   VARCHAR(40)   DEFAULT '',
  industry       VARCHAR(80)   DEFAULT '',
  contact        VARCHAR(120)  DEFAULT '',
  email          VARCHAR(200)  DEFAULT '',
  phone          VARCHAR(40)   DEFAULT '',
  interest       VARCHAR(120)  DEFAULT '',
  need           TEXT          DEFAULT '',
  headcount      INTEGER       NOT NULL DEFAULT 0,
  budget         BIGINT        NOT NULL DEFAULT 0,
  source         VARCHAR(80)   DEFAULT '',
  status         VARCHAR(20)   NOT NULL DEFAULT 'new',
  owner          VARCHAR(120)  DEFAULT '',
  next_follow_up DATE          DEFAULT NULL,
  last_note      TEXT          DEFAULT '',
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enq_status ON enquiries (status);
CREATE INDEX IF NOT EXISTS idx_enq_owner  ON enquiries (owner);

-- ════════════════════════════════════════════════════════════════════
-- SYSTEM
-- ════════════════════════════════════════════════════════════════════

-- Console operators. Separate from `admins`, which holds the single login
-- credential the API authenticates against: this table is the roster the Users
-- screen manages, and it grants nothing on its own.
CREATE TABLE IF NOT EXISTS app_users (
  id            VARCHAR(30)   PRIMARY KEY,
  name          VARCHAR(120)  NOT NULL,
  email         VARCHAR(200)  NOT NULL UNIQUE,
  role          VARCHAR(40)   NOT NULL DEFAULT 'staff',
  status        VARCHAR(20)   NOT NULL DEFAULT 'active',
  two_factor    BOOLEAN       NOT NULL DEFAULT FALSE,
  studio        VARCHAR(120)  DEFAULT '',
  last_login_at TIMESTAMPTZ   DEFAULT NULL,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_au_role ON app_users (role);

-- Append-only: the API exposes no update or delete for this table.
CREATE TABLE IF NOT EXISTS audit_log (
  id      VARCHAR(40)   PRIMARY KEY,
  user_id VARCHAR(30)   DEFAULT NULL,
  "user"  VARCHAR(120)  DEFAULT '',
  action  VARCHAR(60)   NOT NULL,
  area    VARCHAR(60)   DEFAULT '',
  detail  TEXT          DEFAULT '',
  ip      VARCHAR(45)   DEFAULT '',
  at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_at   ON audit_log (at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_area ON audit_log (area);

-- One row per settings section ('general', 'booking', 'academy', 'payments',
-- 'integrations'). A document per section rather than a key-value row per
-- field: the console saves a section at a time, and that is the unit that has
-- to be consistent.
CREATE TABLE IF NOT EXISTS app_settings (
  section    VARCHAR(40)  PRIMARY KEY,
  value      JSONB        NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ════════════════════════════════════════════════════════════════════
-- Lesson video index
--
-- One row per VIDEO lesson in a syllabus, answering "where do this lesson's
-- bytes come from". Deliberately separate from `lesson_videos`:
--
--   lesson_videos      — an uploaded file in R2. One row per upload, owns the
--                        object key, the size, the multipart state.
--   lesson_video_index — a slot in a course outline. Exists whether or not
--                        anything has been uploaded into it, which is what
--                        makes "12 lessons still have no video" answerable.
--
-- Merging them would mean a row for a lesson nobody has filmed yet pretending
-- to be an upload, with a NOT NULL object key it has no value for.
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS lesson_video_index (
  id            VARCHAR(40)   PRIMARY KEY,
  program_id    VARCHAR(30)   NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  program_title VARCHAR(300)  NOT NULL DEFAULT '',
  module_index  INTEGER       NOT NULL DEFAULT 0,
  module_title  VARCHAR(300)  DEFAULT '',
  item_index    INTEGER       NOT NULL DEFAULT 0,
  -- Index among video lessons only — how playback is addressed everywhere else.
  ordinal       INTEGER       NOT NULL DEFAULT 0,
  lesson_title  VARCHAR(300)  DEFAULT '',
  minutes       INTEGER       NOT NULL DEFAULT 0,
  -- 'youtube' | 'r2'. An upload through the console flips this to 'r2'.
  provider      VARCHAR(20)   NOT NULL DEFAULT 'youtube',
  youtube_id    VARCHAR(20)   DEFAULT '',
  -- Set when provider = 'r2': the upload in `lesson_videos` this slot plays.
  video_id      UUID          DEFAULT NULL REFERENCES lesson_videos(id) ON DELETE SET NULL,
  visibility    VARCHAR(20)   NOT NULL DEFAULT 'unlisted',
  free          BOOLEAN       NOT NULL DEFAULT FALSE,
  -- 'ready' | 'missing' — missing is the one the console counts and chases.
  status        VARCHAR(20)   NOT NULL DEFAULT 'missing',
  note          TEXT          DEFAULT '',
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (program_id, module_index, item_index)
);

CREATE INDEX IF NOT EXISTS idx_lvi_program ON lesson_video_index (program_id, ordinal);
CREATE INDEX IF NOT EXISTS idx_lvi_status  ON lesson_video_index (status);

-- ════════════════════════════════════════════════════════════════════
-- Columns the consoles read that the first pass missed.
-- ════════════════════════════════════════════════════════════════════

-- `bookings.service` is the ENQUIRY CATEGORY the public form sends — 'recovery',
-- 'pain', 'wellness' — and the console renders it through SERVICE_LABELS. It is
-- not a product id, and putting one there makes the booking table show raw ids
-- where a label belongs. The product actually booked goes here instead.
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_id VARCHAR(30) DEFAULT NULL;

-- What a printed certificate's QR code points at. Stored rather than derived:
-- the public verification URL is a published address, and a row issued today
-- must keep resolving even if the site later moves the route.
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS verify_url    VARCHAR(500) DEFAULT '';
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS revoke_reason TEXT         DEFAULT '';

-- ════════════════════════════════════════════════════════════════════
-- What the instructor console needs on top of the CRM's shape.
-- ════════════════════════════════════════════════════════════════════

-- The long course description. `subtitle` is the one-line hook on a card;
-- this is the body of the course page, and the instructor console edits both.
ALTER TABLE programs ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';

-- Who actually turned up to a dated session.
--
-- A join table rather than an array on `program_sessions`: attendance is
-- recorded one person at a time by someone standing in a room, and a row per
-- person is what makes that a single insert instead of a read-modify-write of
-- a whole list that two instructors can clobber.
CREATE TABLE IF NOT EXISTS session_attendees (
  session_id VARCHAR(30)  NOT NULL REFERENCES program_sessions(id) ON DELETE CASCADE,
  learner_id VARCHAR(30)  NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  marked_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  PRIMARY KEY (session_id, learner_id)
);

CREATE INDEX IF NOT EXISTS idx_sa_learner ON session_attendees (learner_id);

-- ════════════════════════════════════════════════════════════════════
-- Learner accounts (Google sign-in)
--
-- A learner row is created the first time someone signs in with Google. The
-- site holds the session; this table holds who they are and what they own.
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE learners ADD COLUMN IF NOT EXISTS avatar        VARCHAR(500) DEFAULT '';
-- Google's stable subject id. Kept alongside the email because a person can
-- change their Google email address and would otherwise come back as a
-- stranger, losing every enrolment they paid for.
ALTER TABLE learners ADD COLUMN IF NOT EXISTS google_sub    VARCHAR(64)  DEFAULT NULL;
ALTER TABLE learners ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ  DEFAULT NULL;

-- Case-insensitive: Google returns the address as the user typed it, and
-- "An@gmail.com" and "an@gmail.com" are one person with one enrolment history.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_learners_email ON learners (LOWER(email));
CREATE UNIQUE INDEX IF NOT EXISTS uniq_learners_google_sub ON learners (google_sub)
  WHERE google_sub IS NOT NULL;
