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
