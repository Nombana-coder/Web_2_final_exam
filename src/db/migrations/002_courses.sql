CREATE TABLE IF NOT EXISTS courses (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(20)  NOT NULL UNIQUE,
    name        VARCHAR(150) NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

UPDATE courses
SET updated_at = created_at
WHERE updated_at IS NULL;

ALTER TABLE courses
  ALTER COLUMN updated_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET NOT NULL;

-- Index explicite en plus de la contrainte UNIQUE, utile pour les recherches
-- par code (ex: vérification d'unicité avant insertion/mise à jour).
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses (code);
