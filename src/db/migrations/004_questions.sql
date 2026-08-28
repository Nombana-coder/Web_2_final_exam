CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    exam_id INT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    statement TEXT NOT NULL,
    points INT NOT NULL CHECK (points > 0)
);
