import express from "express";
import {
  addQuestion,
  getQuestionsByQuiz
} from "../controllers/questionController.js";

import { verifyToken } from "../middlewares/authMiddleware.js";
import { isTeacherOrAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, isTeacherOrAdmin, addQuestion);
router.get("/:quizId", getQuestionsByQuiz);

export default router;
