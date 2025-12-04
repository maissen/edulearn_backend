import express from "express";
import { 
  getAllUsers,
  toggleTeacherActivation,
  toggleStudentActivation,
  createTeacher,
  createStudent
} from "../controllers/adminController.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get all users (admins, teachers, students) with all details (admin only)
router.get("/users", verifyToken, isAdmin, getAllUsers);

// Toggle teacher activation status (admin only)
router.patch("/teachers/:id/activation", verifyToken, isAdmin, toggleTeacherActivation);

// Toggle student activation status (admin only)
router.patch("/students/:id/activation", verifyToken, isAdmin, toggleStudentActivation);

// Create a new teacher account (admin only)
router.post("/teachers", verifyToken, isAdmin, createTeacher);

// Create a new student account (admin only)
router.post("/students", verifyToken, isAdmin, createStudent);

export default router;