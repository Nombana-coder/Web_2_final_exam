# WEB2 final exam: Backend

- STD24075: Mamy Ny Aina RAMANAMAHEFA

- STD24109: Andriamanga Rubis RANAIVOSOA

- STD25063: Ny Olontsoa Nombana RAMANITRINIAINA

- STD25064: ANDRIANTSONINA Harena


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
