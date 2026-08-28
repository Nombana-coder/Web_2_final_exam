-- Migration 003 : table exams
--
-- Un examen appartient à un cours et possède une fenêtre de disponibilité
-- (start_at / end_at), vérifiée côté serveur à l'affichage ET à la
-- soumission (RG-03).
--
-- RG-09 : "ON DELETE RESTRICT" sur course_id empêche la suppression d'un
--         cours tant qu'il possède au moins un examen. Un examen qui
--         possède des tentatives ne pourra pas non plus être supprimé
--         (contrainte équivalente à poser sur la future table attempts,
--         migration d'un autre membre de l'équipe).

CREATE TABLE IF NOT EXISTS exams (
    id          SERIAL PRIMARY KEY,
    course_id   INTEGER NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
    title       VARCHAR(150) NOT NULL,
    description TEXT,
    start_at    TIMESTAMPTZ NOT NULL,
    end_at      TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_exam_window CHECK (end_at > start_at)
);

CREATE INDEX IF NOT EXISTS idx_exams_course_id ON exams (course_id);
CREATE INDEX IF NOT EXISTS idx_exams_window ON exams (start_at, end_at);
