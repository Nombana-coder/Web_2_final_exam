import { Router } from 'express';
import { AttemptController } from '../controllers/attemptController';
import { authenticateToken, requireRole } from '../security/AppError';

const router = Router();
const controller = new AttemptController();

router.get('/my/exams', authenticateToken, requireRole('STUDENT'), (req, res) => controller.getAvailableExams(req, res));
router.get('/my/exams/:id', authenticateToken, requireRole('STUDENT'), (req, res) => controller.getExamForStudent(req, res));
router.post('/my/exams/:id/submit', authenticateToken, requireRole('STUDENT'), (req, res) => controller.submitExam(req, res));
router.get('/my/results', authenticateToken, requireRole('STUDENT'), (req, res) => controller.getStudentResults(req, res));

router.get('/exams/:id/results', authenticateToken, requireRole('ADMIN'), (req, res) => controller.getAdminExamResults(req, res));

export default router;