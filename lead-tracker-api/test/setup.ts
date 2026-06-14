// Set deterministic env BEFORE any module (and dotenv) loads.
// dotenv.config() does not override already-set process.env values.
process.env.NODE_ENV = 'test'
process.env.R2_ACCOUNT_ID = 'test-account'
process.env.R2_ACCESS_KEY_ID = 'test-key'
process.env.R2_SECRET_ACCESS_KEY = 'test-secret'
process.env.R2_BUCKET = 'test-bucket'
process.env.R2_PUBLIC_BASE_URL = 'https://cdn.test.example'
