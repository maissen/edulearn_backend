import express from "express";
import {
  getAllQuiz,
  getQuizByCourse,
  createQuiz,
  deleteQuiz,
  submitQuiz
} from "../controllers/quizController.js";

import { verifyToken } from "../middlewares/authMiddleware.js";
import { isTeacherOrAdmin, isEtudiant } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/", getAllQuiz);
router.get("/course/:courseId", getQuizByCourse);
router.post("/", verifyToken, isTeacherOrAdmin, createQuiz);
router.post("/submit", verifyToken, isEtudiant, submitQuiz);
router.delete("/:id", verifyToken, isTeacherOrAdmin, deleteQuiz);

export default router;
