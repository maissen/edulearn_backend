import express from "express";
import { 
  toggleTeacherActivation,
  toggleStudentActivation,
  getAllTeachersWithActivationStatus,
  getAllStudentsWithActivationStatus
} from "../controllers/adminController.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Get all teachers with activation status (admin only)
router.get("/teachers", isAdmin, getAllTeachersWithActivationStatus);

// Get all students with activation status (admin only)
router.get("/students", isAdmin, getAllStudentsWithActivationStatus);

// Toggle teacher activation status (admin only)
router.patch("/teachers/:id/activation", isAdmin, toggleTeacherActivation);

// Toggle student activation status (admin only)
router.patch("/students/:id/activation", isAdmin, toggleStudentActivation);

export default router;