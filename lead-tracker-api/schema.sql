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
