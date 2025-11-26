import express from "express";
import {
  getAllQuiz,
  getQuizByCourse,
  createQuiz,
  deleteQuiz,
  submitQuiz,
  submitTest
} from "../controllers/quizController.js";

import { verifyToken } from "../middlewares/authMiddleware.js";
import { isTeacherOrAdmin, isEtudiant } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/", getAllQuiz);
router.get("/course/:courseId", getQuizByCourse);
router.post("/", verifyToken, isTeacherOrAdmin, createQuiz);

// New route: submit a full test (all quiz answers)
router.post("/test/submit", verifyToken, isEtudiant, submitTest);

// Deprecated: per-quiz submission
router.post("/submit", verifyToken, isEtudiant, submitQuiz);

router.delete("/:id", verifyToken, isTeacherOrAdmin, deleteQuiz);

export default router;
