// src/routes/questionRoutes.ts
import { Router } from 'express';
import { QuestionController } from '../controllers/questionController';
import { requireAuth, requireRole } from '../middlewares/auth'; 

const router = Router();

router.post('/exams/:id/questions', requireAuth, requireRole('admin'), QuestionController.create);
router.get('/exams/:id/questions', requireAuth, requireRole('admin'), QuestionController.getByExam);
router.put('/questions/:id', requireAuth, requireRole('admin'), QuestionController.update);
router.delete('/questions/:id', requireAuth, requireRole('admin'), QuestionController.delete);

export default router;