import { Router } from "express";
import {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  setStudentActive,
  resetStudentPassword,
} from "../controllers/StudentController";
import { requireAuth, requireRole } from "../middlewares/auth";

const router = Router();

// All student management is admin-only.
router.use(requireAuth, requireRole("admin"));

router.get("/", listStudents);
router.get("/:id", getStudent);
router.post("/", createStudent);
router.put("/:id", updateStudent);
router.patch("/:id/active", setStudentActive);
router.patch("/:id/password", resetStudentPassword);

export default router;
