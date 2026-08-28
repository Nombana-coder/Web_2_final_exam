import { Router } from 'express';
import { AttemptController } from '../controllers/attemptController';
import { requireAuth, requireRole } from '../middlewares/auth';

const router = Router();
const controller = new AttemptController();

router.get('/my/exams', requireAuth, requireRole('student'), (req, res) => controller.getAvailableExams(req, res));
router.get('/my/exams/:id', requireAuth, requireRole('student'), (req, res) => controller.getExamForStudent(req, res));
router.post('/my/exams/:id/submit', requireAuth, requireRole('student'), (req, res) => controller.submitExam(req, res));
router.get('/my/results', requireAuth, requireRole('student'), (req, res) => controller.getStudentResults(req, res));

router.get('/exams/:id/results', requireAuth, requireRole('admin'), (req, res) => controller.getAdminExamResults(req, res));

export default router;