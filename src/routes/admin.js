import express from "express";
import { 
  getAllUsers,
  getStatistics,
  toggleTeacherActivation,
  toggleStudentActivation,
  createTeacher,
  createStudent,
  deleteTeacher,
  deleteStudent,
  getAllTeacherCourses,
  deleteCourse
} from "../controllers/adminController.js";
import { getLogs, getLogStats, exportLogsCSV, clearLogs } from "../controllers/logController.js";
import { createBackup, listBackups, downloadBackup, deleteBackup } from "../controllers/backupController.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get all users (admins, teachers, students) with all details (admin only)
router.get("/users", verifyToken, isAdmin, getAllUsers);

// Get statistics (admin only)
router.get("/statistics", verifyToken, isAdmin, getStatistics);

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

// Get logs (admin only)
router.get("/logs", verifyToken, isAdmin, getLogs);

// Clear all logs (admin only)
router.delete("/logs", verifyToken, isAdmin, clearLogs);

// Get log stats (admin only)
router.get("/log-stats", verifyToken, isAdmin, getLogStats);

// Export logs as CSV (admin only)
router.get("/logs/export", verifyToken, isAdmin, exportLogsCSV);

// Create database backup (admin only)
router.post("/backup", verifyToken, isAdmin, createBackup);

// List available backups (admin only)
router.get("/backups", verifyToken, isAdmin, listBackups);

// Download a backup file (admin only)
router.get("/backups/:filename", verifyToken, isAdmin, downloadBackup);

// Delete a backup file (admin only)
router.delete("/backups/:filename", verifyToken, isAdmin, deleteBackup);

export default router;