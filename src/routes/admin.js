import express from "express";
import { 
  getAllUsers,
  toggleTeacherActivation,
  toggleStudentActivation,
  createTeacher,
  createStudent,
  deleteTeacher,
  deleteStudent,
  getAllTeacherCourses,
  deleteCourse
} from "../controllers/adminController.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get all users (admins, teachers, students) with all details (admin only)
router.get("/users", verifyToken, isAdmin, getAllUsers);

// Get all courses of teachers with all details (admin only)
router.get("/teacher-courses", verifyToken, isAdmin, getAllTeacherCourses);

// Toggle teacher activation status (admin only)
router.patch("/teachers/:id/activation", verifyToken, isAdmin, toggleTeacherActivation);

// Toggle student activation status (admin only)
router.patch("/students/:id/activation", verifyToken, isAdmin, toggleStudentActivation);

// Create a new teacher account (admin only)
router.post("/teachers", verifyToken, isAdmin, createTeacher);

// Create a new student account (admin only)
router.post("/students", verifyToken, isAdmin, createStudent);

// Delete a teacher account and all related data (admin only)
router.delete("/teachers/:id", verifyToken, isAdmin, deleteTeacher);

// Delete a student account and all related data (admin only)
router.delete("/students/:id", verifyToken, isAdmin, deleteStudent);

// Delete a course and all related data (admin only)
router.delete("/courses/:id", verifyToken, isAdmin, deleteCourse);

export default router;