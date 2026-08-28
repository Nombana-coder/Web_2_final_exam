# WEB2 final exam: Backend

Run the database migrations in order with `npm run migrate`. Applied migrations
are recorded in `schema_migrations`, and the legacy all-in-one SQL export is kept
under `src/db/legacy` rather than being executed by the migration runner.

- STD24075: Mamy Ny Aina RAMANAMAHEFA

- STD24109: Andriamanga Rubis RANAIVOSOA

- STD25063: Ny Olontsoa Nombana RAMANITRINIAINA

- STD25064: ANDRIANTSONINA Harena

- STD25105: Ramilison Léona SOLONIRINA


****

# PostgreSQL structure:
```
 users
 ├── id
 ├── name
 ├── email
 ├── password_hash
 ├── role
 └── active

courses
 ├── id
 ├── code
 ├── name
 └── description

exams
 ├── id
 ├── course_id
 ├── title
 ├── description
 ├── start_at
 └── end_at

questions
 ├── id
 ├── exam_id
 ├── statement
 └── points

choices
 ├── id
 ├── question_id
 ├── text
 └── is_correct

attempts
 ├── id
 ├── exam_id
 ├── student_id
 ├── score
 └── submitted_at

answers
 ├── id
 ├── attempt_id
 ├── question_id
 └── choice_id
```
