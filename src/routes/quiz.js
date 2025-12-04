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

// Obtenir le test et les questions pour un cours
router.get("/test/course/:courseId", getTestByCourse);

// Créer un nouveau test pour un cours (enseignant uniquement)
router.post("/test", verifyToken, isAccountActivated, isTeacherOrAdmin, createTest);

// Supprimer un test (enseignant uniquement)
router.delete("/test/:id", verifyToken, isAccountActivated, isTeacherOrAdmin, deleteTest);

// Remarque : La route de soumission du test a été déplacée vers app.js pour la rendre accessible à /test/submit
// router.post("/test/submit", verifyToken, isAccountActivated, isEtudiant, submitTest);

export default router;