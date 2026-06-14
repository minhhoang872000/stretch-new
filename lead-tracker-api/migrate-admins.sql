-- Run this in Supabase SQL Editor (Database → SQL Editor)
-- Creates the admins table and inserts the default admin account.

CREATE TABLE IF NOT EXISTS admins (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(200)  NOT NULL UNIQUE,
  name          VARCHAR(100)  NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  created_at    TIMESTAMPTZ   DEFAULT NOW()
);

-- Default admin: admin@stretch.vn / Admin@stretch1
INSERT INTO admins (email, name, password_hash)
VALUES (
  'admin@stretch.vn',
  'Stretch Admin',
  '$2b$12$GTS3maKwUOGpW0mI5pUuQ.5cf9rvlNMzsO6rFP3IaiChnxMGzu9ee'
)
ON CONFLICT (email) DO NOTHING;
