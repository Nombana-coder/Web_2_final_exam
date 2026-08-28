# API Contract — Exam Hub

Draft JSON shapes for each entity. Review together before building on top of this — once B/C/D start coding against it, changes get expensive.

All error responses follow RG-13: `{ "message": "..." }` with status 400/401/403/404/409.

## Auth

**POST /api/auth/login**
Request:
```json
{ "email": "admin@examhub.com", "password": "secret" }
```
Response 200:
```json
{
  "token": "eyJhbGciOi...",
  "user": { "id": 1, "name": "Admin", "email": "admin@examhub.com", "role": "admin" }
}
```
Response 401: `{ "message": "Invalid credentials" }`
Response 403 (deactivated account, RG-11): `{ "message": "Account is deactivated" }`

**GET /api/auth/me**
Requires `Authorization: Bearer <token>`. Returns the current user (rehydrates session on page reload).
Response 200:
```json
{ "id": 1, "name": "Admin", "email": "admin@examhub.com", "role": "admin", "active": true }
```
Response 401: `{ "message": "Invalid or expired token" }`

## Student

All `/api/students` routes require `Authorization: Bearer <token>` for an **admin** user (403 otherwise).

**GET /api/students?page=1&limit=10** — paginated list, shape per "Pagination" section below.

**GET /api/students/:id**
Response 200: student object (see below). Response 404 if not found.

**POST /api/students**
Request:
```json
{ "name": "Jane Doe", "email": "jane@student.com", "password": "secret123" }
```
Response 201: student object. Response 409 if email already in use.

**PUT /api/students/:id**
Request (either field optional):
```json
{ "name": "Jane D.", "email": "jane.d@student.com" }
```
Response 200: updated student object. Response 404 / 409 (email conflict) as applicable.

**PATCH /api/students/:id/active**
Request:
```json
{ "active": false }
```
Response 200: updated student object. Used to deactivate/reactivate (RG-11) — a deactivated student can no longer log in.

Student object shape:
```json
{
  "id": 1,
  "name": "Jane Doe",
  "email": "jane@student.com",
  "role": "student",
  "active": true
}
```
Note: `password_hash` never leaves the backend. `POST /api/students` accepts a `password` field (initial password) instead.

## Course

```json
{
  "id": 1,
  "code": "PROG2",
  "name": "Programmation Orientée Objet",
  "description": "..."
}
```

## Exam

```json
{
  "id": 1,
  "course_id": 1,
  "title": "Examen final PROG2",
  "description": "...",
  "start_at": "2026-09-01T08:00:00Z",
  "end_at": "2026-09-01T10:00:00Z"
}
```

## Question (admin view — includes correct answer)

```json
{
  "id": 1,
  "exam_id": 1,
  "statement": "What does JVM stand for?",
  "points": 2,
  "choices": [
    { "id": 1, "text": "Java Virtual Machine", "is_correct": true },
    { "id": 2, "text": "Java Verified Method", "is_correct": false }
  ],
  "locked": false
}
```
`locked: true` once the exam has at least one attempt (RG-08) — front should disable edit/delete when this is true.

## Question (student view during exam — RG-07: no is_correct)

```json
{
  "id": 1,
  "statement": "What does JVM stand for?",
  "points": 2,
  "choices": [
    { "id": 1, "text": "Java Virtual Machine" },
    { "id": 2, "text": "Java Verified Method" }
  ]
}
```

## Submit exam

**POST /api/my/exams/:id/submit**
Request (RG-05: partial submission allowed, unanswered = omit or null):
```json
{
  "answers": [
    { "question_id": 1, "choice_id": 1 },
    { "question_id": 2, "choice_id": null }
  ]
}
```
Response 200 (RG-12: score + full correction):
```json
{
  "score": 8,
  "max_score": 10,
  "submitted_at": "2026-09-01T09:15:00Z",
  "corrections": [
    {
      "question_id": 1,
      "statement": "...",
      "your_choice_id": 1,
      "correct_choice_id": 1,
      "is_correct": true,
      "points": 2
    }
  ]
}
```

## Exam results (admin)

**GET /api/exams/:id/results**
```json
{
  "exam_id": 1,
  "average_score": 7.4,
  "attempt_count": 12,
  "students": [
    { "student_id": 3, "name": "Jane Doe", "score": 8, "submitted_at": "..." }
  ]
}
```

## Pagination (students / courses / exams list endpoints)

Confirmed: 10 items per page. Query params `?page=1&limit=10` (default `page=1`, `limit=10`).

Response shape for paginated list endpoints:
```json
{
  "data": [ /* array of items */ ],
  "page": 1,
  "limit": 10,
  "total": 34,
  "total_pages": 4
}
```

---

**Team-confirmed decisions:**
- Date format: ISO 8601 UTC strings everywhere (as shown above) — **confirmed**
- `max_score` on submit response = sum of all question points, regardless of which were answered — **confirmed**
- Pagination: 10 items per page on list endpoints — **confirmed**, see shape above
