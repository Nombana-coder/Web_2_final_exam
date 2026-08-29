#!/usr/bin/env node
/**
 *   BASE_URL            default http://localhost:3000
 *   ADMIN_EMAIL         default admin@examhub.com   (must already exist — run `npm run seed:admin` first)
 *   ADMIN_PASSWORD      default Admin123!
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@examhub.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!';

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const DIM = '\x1b[2m';
const CYAN = '\x1b[36m';

let passed = 0;
let failed = 0;
const failures = [];

function log(msg) {
  console.log(msg);
}

function ok(label, detail = '') {
  passed++;
  log(`${GREEN}✓${RESET} ${label}${detail ? DIM + '  ' + detail + RESET : ''}`);
}

function fail(label, detail) {
  failed++;
  failures.push(label);
  log(`${RED}✗ ${label}${RESET}${detail ? '\n    ' + DIM + detail + RESET : ''}`);
}

function section(title) {
  log(`\n${CYAN}── ${title} ──${RESET}`);
}

async function api(method, path, { token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const status = res.status;
  const text = await res.text();
  let parsed;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }
  return { status, body: parsed };
}

function assert(condition, label, detail) {
  if (condition) {
    ok(label);
  } else {
    fail(label, detail);
  }
}

const runId = Date.now();

async function main() {
  log(`${CYAN}ExamHub smoke test${RESET} — target: ${BASE_URL}\n`);

  section('Health check');
  const health = await api('GET', '/health');
  assert(health.status === 200 && health.body?.status === 'ok', 'GET /health -> 200 { status: "ok" }', JSON.stringify(health.body));

  // Admin login
  section('Admin auth');
  const adminLogin = await api('POST', '/api/auth/login', {
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  assert(
    adminLogin.status === 200 && adminLogin.body?.token && adminLogin.body?.user?.role === 'admin',
    'POST /api/auth/login (admin) -> 200 { token, user.role: "admin" }',
    `status=${adminLogin.status} body=${JSON.stringify(adminLogin.body)}`
  );
  const adminToken = adminLogin.body?.token;
  if (!adminToken) {
    log(`${RED}Cannot continue without an admin token. Did you run "npm run seed:admin"?${RESET}`);
    return printSummary();
  }

  const wrongLogin = await api('POST', '/api/auth/login', {
    body: { email: ADMIN_EMAIL, password: 'definitely-wrong' },
  });
  assert(wrongLogin.status === 401, 'POST /api/auth/login (wrong password) -> 401', JSON.stringify(wrongLogin.body));

  const me = await api('GET', '/api/auth/me', { token: adminToken });
  assert(me.status === 200 && me.body?.email === ADMIN_EMAIL, 'GET /api/auth/me -> 200 (matches logged-in admin)', JSON.stringify(me.body));

  // Course
  section('Courses (RG-09)');
  const courseCode = `SMOKE${runId}`;
  const createCourse = await api('POST', '/api/courses', {
    token: adminToken,
    body: { code: courseCode, name: 'Smoke Test Course', description: 'Created by smoke-test.js' },
  });
  assert(createCourse.status === 201 && createCourse.body?.id, 'POST /api/courses -> 201', JSON.stringify(createCourse.body));
  const courseId = createCourse.body?.id;

  const dupCourse = await api('POST', '/api/courses', {
    token: adminToken,
    body: { code: courseCode, name: 'Duplicate code', description: '' },
  });
  assert(dupCourse.status === 409, 'POST /api/courses (duplicate code) -> 409', JSON.stringify(dupCourse.body));

  const listCourses = await api('GET', '/api/courses', { token: adminToken });
  assert(
    listCourses.status === 200 && Array.isArray(listCourses.body?.data) && typeof listCourses.body?.total_pages === 'number',
    'GET /api/courses -> 200 paginated { data, page, limit, total, total_pages }',
    JSON.stringify(listCourses.body)
  );

  //Student account
  section('Students');
  const studentEmail = `smoke.student.${runId}@examhub.test`;
  const studentPassword = 'Student123!';
  const createStudent = await api('POST', '/api/students', {
    token: adminToken,
    body: { name: 'Smoke Test Student', email: studentEmail, password: studentPassword },
  });
  assert(
    createStudent.status === 201 && createStudent.body?.role === 'student',
    'POST /api/students -> 201 { role: "student" }',
    JSON.stringify(createStudent.body)
  );
  const studentId = createStudent.body?.id;

  const shortPassword = await api('POST', '/api/students', {
    token: adminToken,
    body: { name: 'Too Short', email: `short.${runId}@examhub.test`, password: '123' },
  });
  assert(shortPassword.status === 400, 'POST /api/students (password < 6 chars) -> 400', JSON.stringify(shortPassword.body));

  //Exam within the current window
  section('Exams');
  const now = Date.now();
  const startAt = new Date(now - 5 * 60 * 1000).toISOString(); // started 5 min ago
  const endAt = new Date(now + 60 * 60 * 1000).toISOString(); // ends in 1h
  const createExam = await api('POST', '/api/exams', {
    token: adminToken,
    body: { course_id: courseId, title: 'Smoke Test Exam', description: '', start_at: startAt, end_at: endAt },
  });
  assert(createExam.status === 201 && createExam.body?.id, 'POST /api/exams (open window) -> 201', JSON.stringify(createExam.body));
  const examId = createExam.body?.id;

  const badWindow = await api('POST', '/api/exams', {
    token: adminToken,
    body: { course_id: courseId, title: 'Bad window', start_at: endAt, end_at: startAt },
  });
  assert(badWindow.status === 400, 'POST /api/exams (end_at before start_at) -> 400', JSON.stringify(badWindow.body));

  // Question
  section('Questions (RG-04, RG-08)');
  const createQuestion = await api('POST', `/api/exams/${examId}/questions`, {
    token: adminToken,
    body: {
      statement: 'What does HTTP stand for?',
      points: 5,
      choices: [
        { text: 'HyperText Transfer Protocol', is_correct: true },
        { text: 'HighText Transmission Process', is_correct: false },
        { text: 'HyperTransfer Text Protocol', is_correct: false },
      ],
    },
  });
  assert(
    createQuestion.status === 201 && createQuestion.body?.choices?.length === 3,
    'POST /api/exams/:id/questions -> 201',
    JSON.stringify(createQuestion.body)
  );
  const questionId = createQuestion.body?.id;
  const correctChoice = createQuestion.body?.choices?.find((c) => c.is_correct);
  const wrongChoice = createQuestion.body?.choices?.find((c) => !c.is_correct);

  const tooFewChoices = await api('POST', `/api/exams/${examId}/questions`, {
    token: adminToken,
    body: { statement: 'Only one choice?', points: 1, choices: [{ text: 'Solo', is_correct: true }] },
  });
  assert(tooFewChoices.status === 400, 'POST .../questions (only 1 choice) -> 400 (RG-04)', JSON.stringify(tooFewChoices.body));

  const zeroCorrect = await api('POST', `/api/exams/${examId}/questions`, {
    token: adminToken,
    body: {
      statement: 'No correct answer?',
      points: 1,
      choices: [
        { text: 'A', is_correct: false },
        { text: 'B', is_correct: false },
      ],
    },
  });
  assert(zeroCorrect.status === 400, 'POST .../questions (0 correct choices) -> 400 (RG-04)', JSON.stringify(zeroCorrect.body));

  //Student login
  section('Student auth & available exams (RG-02, RG-03)');
  const studentLogin = await api('POST', '/api/auth/login', {
    body: { email: studentEmail, password: studentPassword },
  });
  assert(
    studentLogin.status === 200 && studentLogin.body?.user?.role === 'student',
    'POST /api/auth/login (student) -> 200',
    JSON.stringify(studentLogin.body)
  );
  const studentToken = studentLogin.body?.token;

  const available = await api('GET', '/api/my/exams', { token: studentToken });
  const examIsListed = Array.isArray(available.body) && available.body.some((e) => e.id === examId);
  assert(available.status === 200 && examIsListed, 'GET /api/my/exams -> includes the open exam', JSON.stringify(available.body));

  const examDetail = await api('GET', `/api/my/exams/${examId}`, { token: studentToken });
  const hasNoAnswerLeak = examDetail.body?.questions?.every((q) => q.choices.every((c) => c.is_correct === undefined));
  assert(
    examDetail.status === 200 && hasNoAnswerLeak,
    'GET /api/my/exams/:id -> 200, choices never expose is_correct (RG-07)',
    JSON.stringify(examDetail.body)
  );

  //Submit
  section('Submit exam (RG-05, RG-12)');
  const submit = await api('POST', `/api/my/exams/${examId}/submit`, {
    token: studentToken,
    body: { answers: [{ question_id: questionId, choice_id: correctChoice?.id }] },
  });
  assert(
    submit.status === 200 &&
      submit.body?.score === 5 &&
      submit.body?.max_score === 5 &&
      Array.isArray(submit.body?.corrections) &&
      submit.body.corrections[0]?.is_correct === true,
    'POST .../submit (correct answer) -> 200 { score: 5, max_score: 5, corrections: [...] }',
    JSON.stringify(submit.body)
  );

  const resubmit = await api('POST', `/api/my/exams/${examId}/submit`, {
    token: studentToken,
    body: { answers: [{ question_id: questionId, choice_id: correctChoice?.id }] },
  });
  assert(resubmit.status === 409, 'POST .../submit again -> 409 (RG-02: one attempt only)', JSON.stringify(resubmit.body));

  const results = await api('GET', '/api/my/results', { token: studentToken });
  assert(
    results.status === 200 && Array.isArray(results.body?.results) && results.body.results.length === 1,
    'GET /api/my/results -> 200 { results: [...], average }',
    JSON.stringify(results.body)
  );

  //Admin sees the result
  section('Admin exam results');
  const adminResults = await api('GET', `/api/exams/${examId}/results`, { token: adminToken });
  const studentRow = adminResults.body?.students?.find((s) => s.student_id === studentId);
  assert(
    adminResults.status === 200 &&
      adminResults.body?.exam_id === examId &&
      adminResults.body?.attempt_count === 1 &&
      studentRow?.score === 5,
    'GET /api/exams/:id/results -> 200 { exam_id, average_score, attempt_count, students: [...] }',
    JSON.stringify(adminResults.body)
  );

  // RG-08: locked once an attempt exists
  section('RG-08 — exam locked after first attempt');
  const editLocked = await api('PUT', `/api/questions/${questionId}`, {
    token: adminToken,
    body: {
      statement: 'Edited after attempts exist',
      points: 5,
      choices: [
        { text: 'A', is_correct: true },
        { text: 'B', is_correct: false },
      ],
    },
  });
  assert(editLocked.status === 409, 'PUT /api/questions/:id (exam has attempts) -> 409 (RG-08)', JSON.stringify(editLocked.body));

  //RG-09: course with exams can't be deleted
  section('RG-09 — course with exams protected');
  const deleteCourseBlocked = await api('DELETE', `/api/courses/${courseId}`, { token: adminToken });
  assert(deleteCourseBlocked.status === 409, 'DELETE /api/courses/:id (course has exams) -> 409 (RG-09)', JSON.stringify(deleteCourseBlocked.body));

  //RG-11: deactivated student can't log in
  section('RG-11 — deactivated account cannot log in');
  const deactivate = await api('PATCH', `/api/students/${studentId}/active`, {
    token: adminToken,
    body: { active: false },
  });
  assert(deactivate.status === 200 && deactivate.body?.active === false, 'PATCH /api/students/:id/active -> 200 { active: false }', JSON.stringify(deactivate.body));

  const loginWhileSuspended = await api('POST', '/api/auth/login', {
    body: { email: studentEmail, password: studentPassword },
  });
  assert(loginWhileSuspended.status === 403, 'POST /api/auth/login (suspended student) -> 403 (RG-11)', JSON.stringify(loginWhileSuspended.body));

  // Reactivate so the account is left in a clean state for manual poking around.
  await api('PATCH', `/api/students/${studentId}/active`, { token: adminToken, body: { active: true } });

  //RG-01: no self-registration endpoint
  section('RG-01 — no public self-registration');
  const registerAttempt = await api('POST', '/api/auth/register', { body: { email: 'x@x.com', password: 'x' } });
  assert(registerAttempt.status === 404, 'POST /api/auth/register -> 404 (route does not exist)', JSON.stringify(registerAttempt.body));

  printSummary();
}

function printSummary() {
  log(`\n${CYAN}── Summary ──${RESET}`);
  log(`${GREEN}${passed} passed${RESET}, ${failed ? RED : DIM}${failed} failed${RESET}`);
  if (failed > 0) {
    log(`\nFailed checks:`);
    failures.forEach((f) => log(`  ${RED}✗${RESET} ${f}`));
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(`${RED}Smoke test crashed:${RESET}`, err);
  process.exitCode = 1;
});
