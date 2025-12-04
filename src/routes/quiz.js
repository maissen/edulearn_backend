import express from "express";
import {
  getTestByCourse,
  createTest,
  deleteTest,
  submitTest,
} from "../controllers/quizController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { isAccountActivated } from "../middlewares/activationMiddleware.js";
import { isTeacherOrAdmin, isEtudiant } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Get the test and questions for a course
router.get("/test/course/:courseId", getTestByCourse);

// Create a new test for a course (teacher only)
router.post("/test", verifyToken, isAccountActivated, isTeacherOrAdmin, createTest);

// Delete a test (teacher only)
router.delete("/test/:id", verifyToken, isAccountActivated, isTeacherOrAdmin, deleteTest);

// Note: The submit test route has been moved to app.js to make it accessible at /test/submit
// router.post("/test/submit", verifyToken, isAccountActivated, isEtudiant, submitTest);

export default router;