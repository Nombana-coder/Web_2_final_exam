import { Router } from 'express';
import { ExamController } from '../controllers/ExamController';
import { requireAuth, requireRole } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/errorHandler';

// Surface imposée : GET/POST /api/exams, GET/PUT/DELETE /api/exams/:id
// Toutes les routes sont réservées à l'administrateur.
// (les routes /api/exams/:id/questions et /results sont gérées par une autre tâche)

const router = Router();
const controller = new ExamController();

router.use(requireAuth, requireRole('admin'));

router.get('/', asyncHandler((req, res) => controller.list(req, res)));
router.post('/', asyncHandler((req, res) => controller.create(req, res)));
router.get('/:id', asyncHandler((req, res) => controller.getById(req, res)));
router.put('/:id', asyncHandler((req, res) => controller.update(req, res)));
router.delete('/:id', asyncHandler((req, res) => controller.delete(req, res)));

export default router;
