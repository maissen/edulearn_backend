import express from "express";
import {
  getAllQuiz,
  createQuiz,
  deleteQuiz
} from "../controllers/quizController.js";

import { verifyToken } from "../middlewares/authMiddleware.js";
import { isTeacherOrAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/", getAllQuiz);
router.post("/", verifyToken, isTeacherOrAdmin, createQuiz);
router.delete("/:id", verifyToken, isTeacherOrAdmin, deleteQuiz);

export default router;
