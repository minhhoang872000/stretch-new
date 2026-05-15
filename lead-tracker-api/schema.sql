-- ============================================================
-- Lead Tracker — MySQL Schema
-- Run this once to create the database and tables.
-- ============================================================

CREATE DATABASE IF NOT EXISTS lead_tracker
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE lead_tracker;

-- ─── Lead Events (Tracking) ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lead_events (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
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
  timestamp       DATETIME        NOT NULL COMMENT 'Client-provided event time',
  created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP COMMENT 'Server insert time',

  INDEX idx_session     (session_id),
  INDEX idx_page_source (page_source),
  INDEX idx_created_at  (created_at),
  INDEX idx_utm_source  (utm_source),
  INDEX idx_utm_campaign (utm_campaign)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  price                 INT UNSIGNED  NOT NULL DEFAULT 0,
  currency              VARCHAR(10)   NOT NULL DEFAULT 'VND',
  cover_image           VARCHAR(500)  DEFAULT NULL,
  images                JSON          DEFAULT NULL,
  category              VARCHAR(50)   DEFAULT NULL,
  tags                  JSON          DEFAULT NULL,
  available             BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at            DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_category    (category),
  INDEX idx_available   (available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Practitioners ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS practitioners (
  id            VARCHAR(20)   PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  avatar        VARCHAR(500)  DEFAULT NULL,
  bio           TEXT          DEFAULT NULL,
  specialties   JSON          DEFAULT NULL,
  services      JSON          DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Practitioner ↔ Service (many-to-many) ───────────────────────────

CREATE TABLE IF NOT EXISTS practitioner_services (
  practitioner_id VARCHAR(20) NOT NULL,
  service_id      VARCHAR(20) NOT NULL,
  PRIMARY KEY (practitioner_id, service_id),
  FOREIGN KEY (practitioner_id) REFERENCES practitioners(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Bookings ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bookings (
  id            VARCHAR(30)   PRIMARY KEY,
  service       VARCHAR(20)   NOT NULL,
  practitioner  VARCHAR(20)   DEFAULT NULL,
  date          VARCHAR(10)   NOT NULL COMMENT 'YYYY-MM-DD',
  time          VARCHAR(20)   NOT NULL COMMENT 'HH:mm or flexible',
  name          VARCHAR(200)  NOT NULL,
  phone         VARCHAR(20)   NOT NULL,
  email         VARCHAR(200)  DEFAULT NULL,
  note          TEXT          DEFAULT NULL,
  session_id    VARCHAR(64)   DEFAULT NULL COMMENT 'Links booking to lead_events.session_id',
  status        ENUM('pending','confirmed','cancelled','completed') NOT NULL DEFAULT 'pending',
  created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      DEFAULT NULL,

  INDEX idx_status     (status),
  INDEX idx_date       (date),
  INDEX idx_service    (service),
  INDEX idx_created_at_bk (created_at),
  INDEX idx_session    (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Migration: add session_id to existing bookings table ───────────
-- Run this if bookings table already exists without the column:
-- ALTER TABLE bookings ADD COLUMN session_id VARCHAR(64) DEFAULT NULL AFTER note;
-- ALTER TABLE bookings ADD INDEX idx_session (session_id);
