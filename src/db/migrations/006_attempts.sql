CREATE TABLE attempts (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    exam_id INT NOT NULL REFERENCES exams(id) ON DELETE RESTRICT,
    score INT NOT NULL DEFAULT 0,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_exam UNIQUE (student_id, exam_id) -- RG-02
);

