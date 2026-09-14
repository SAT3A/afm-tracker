-- Seed default admin user and initial personas for AFM Apps

-- 1. Default Admin User: admin@afm.com / password123
INSERT INTO "users" ("id", "name", "email", "password_hash", "created_at", "updated_at")
VALUES (
  'user_admin_default',
  'Satria Admin',
  'admin@afm.com',
  '$2b$10$L0D6hq5Rk.oEjpRH43XhKOHkn45Q6RAzCcwlERNxPlGlET4M7bKU.',
  NOW(),
  NOW()
)
ON CONFLICT ("email") DO NOTHING;

-- 2. Default Persona 1: Bagas
INSERT INTO "personas" ("id", "name", "niches", "description", "status", "created_at", "updated_at")
VALUES (
  'persona_bagas_01',
  'Bagas',
  '["gym", "outfit", "parfum", "lifestyle cowok"]'::jsonb,
  'Persona AI untuk konten lifestyle cowok, rekomendasi pakaian gym, outfit kasual & formal, serta review parfum pria.',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO NOTHING;

-- 3. Default Persona 2: Naya
INSERT INTO "personas" ("id", "name", "niches", "description", "status", "created_at", "updated_at")
VALUES (
  'persona_naya_02',
  'Naya',
  '["skincare", "homeliving", "beauty"]'::jsonb,
  'Persona AI untuk review skincare, perawatan wajah/kulit, kecantikan, serta dekorasi dan perlengkapan home living.',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO NOTHING;
