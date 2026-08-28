import { Router } from 'express';
import { AttemptController } from '../controllers/attemptController';
import { requireAuth, requireRole } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/errorHandler';

const router = Router();
const controller = new AttemptController();

router.get('/my/exams', requireAuth, requireRole('student'), asyncHandler(controller.getAvailableExams.bind(controller)));
router.get('/my/exams/:id', requireAuth, requireRole('student'), asyncHandler(controller.getExamForStudent.bind(controller)));
router.post('/my/exams/:id/submit', requireAuth, requireRole('student'), asyncHandler(controller.submitExam.bind(controller)));
router.get('/my/results', requireAuth, requireRole('student'), asyncHandler(controller.getStudentResults.bind(controller)));

router.get('/exams/:id/results', requireAuth, requireRole('admin'), asyncHandler(controller.getAdminExamResults.bind(controller)));

export default router;