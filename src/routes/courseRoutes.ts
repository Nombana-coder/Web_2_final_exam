import { Router } from 'express';
import { CourseController } from '../controllers/CourseController';
import { requireAuth, requireRole } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/errorHandler';

const router = Router();
const controller = new CourseController();

router.use(requireAuth, requireRole('admin'));

router.get('/', asyncHandler((req, res) => controller.list(req, res)));
router.post('/', asyncHandler((req, res) => controller.create(req, res)));
router.put('/:id', asyncHandler((req, res) => controller.update(req, res)));
router.delete('/:id', asyncHandler((req, res) => controller.delete(req, res)));

export default router;
