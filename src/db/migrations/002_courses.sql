CREATE TABLE IF NOT EXISTS courses (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(20)  NOT NULL UNIQUE,
    name        VARCHAR(150) NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index explicite en plus de la contrainte UNIQUE, utile pour les recherches
-- par code (ex: vérification d'unicité avant insertion/mise à jour).
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses (code);
