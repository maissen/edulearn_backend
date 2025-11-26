import express from "express";
import {
  getTestByCourse,
  createTest,
  deleteTest,
  submitTest,
} from "../controllers/quizController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { isTeacherOrAdmin, isEtudiant } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Get the test and questions for a course
router.get("/test/course/:courseId", getTestByCourse);

// Create a new test for a course (teacher only)
router.post("/test", verifyToken, isTeacherOrAdmin, createTest);

// Delete a test (teacher only)
router.delete("/test/:id", verifyToken, isTeacherOrAdmin, deleteTest);

// Student submits answers to a test
router.post("/test/submit", verifyToken, isEtudiant, submitTest);

export default router;
