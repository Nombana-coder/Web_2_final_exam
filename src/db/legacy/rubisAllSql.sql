-- 1. Table Utilisateurs (Fournie) - RG-01, RG-10, RG-11
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'student')),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Table Cours - RG-09
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL, -- ex: PROG2, NET101
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Table Examens - RG-03, RG-08, RG-09
CREATE TABLE exams (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_exam_dates CHECK (end_time > start_time)
);

-- 4. Table Questions - RG-04, RG-08
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    exam_id INT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    statement TEXT NOT NULL,
    points INT NOT NULL CHECK (points > 0)
);

-- 5. Table Choix de réponse - RG-04, RG-07
CREATE TABLE choices (
    id SERIAL PRIMARY KEY,
    question_id INT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE
);

-- 6. Table Tentatives d'examen - RG-02, RG-06
CREATE TABLE exam_attempts (
    id SERIAL PRIMARY KEY,
    exam_id INT NOT NULL REFERENCES exams(id) ON DELETE RESTRICT,
    student_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    score INT NOT NULL DEFAULT 0,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_student_exam_attempt UNIQUE (student_id, exam_id) -- Garantit RG-02 en BD
);

-- 7. Table Réponses soumises par l'étudiant - RG-05, RG-06
CREATE TABLE attempt_answers (
    id SERIAL PRIMARY KEY,
    attempt_id INT NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
    question_id INT NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
    choice_id INT REFERENCES choices(id) ON DELETE RESTRICT,
    CONSTRAINT unique_question_per_attempt UNIQUE (attempt_id, question_id)
);




-- 1. Administrateur par défaut (Mot de passe: Admin123!)
INSERT INTO users (name, email, password_hash, role, active)
VALUES (
    'Administrateur',
    'admin@examhub.com',
    '$2b$10$eE0mQe832Xv9K8mO2j3Aue0Yy8x3sHnQ2ZkY/v2a9S3.B8G5Q8.2K',
    'admin',
    true
) ON CONFLICT DO NOTHING;

-- 2. Étudiant de test (Mot de passe: Student123!)
INSERT INTO users (name, email, password_hash, role, active)
VALUES (
    'Jean Dupont',
    'student@examhub.com',
    '$2b$10$eE0mQe832Xv9K8mO2j3Aue0Yy8x3sHnQ2ZkY/v2a9S3.B8G5Q8.2K',
    'student',
    true
) ON CONFLICT DO NOTHING;

-- 3. Mock Cours & Examen (Pour Personne 2 & Personne 3)
INSERT INTO courses (id, code, name, description) 
VALUES (1, 'PROG2', 'Programmation Web', 'Cours complet React et Node.js') 
ON CONFLICT DO NOTHING;

INSERT INTO exams (id, course_id, title, description, start_time, end_time) 
VALUES (1, 1, 'Examen Final Web', 'Évaluation de fin de module', NOW() - INTERVAL '1 hour', NOW() + INTERVAL '1 day') 
ON CONFLICT DO NOTHING;


