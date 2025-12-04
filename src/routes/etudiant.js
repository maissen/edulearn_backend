import express from "express";
import {
  getAllEtudiants,
  addEtudiant,
  updateEtudiant,
  deleteEtudiant,
  startCourse,
  completeCourse,
  getCoursesInProgress,
  getCompletedCourses,
  checkEnrollmentStatus,
  checkCompletionStatus,
  getStudentTestResults
} from "../controllers/etudiantController.js";

import { verifyToken } from "../middlewares/authMiddleware.js";
import { isAccountActivated } from "../middlewares/activationMiddleware.js";
import { isAdmin, isEtudiant } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/", getAllEtudiants);
router.post("/", verifyToken, isAdmin, addEtudiant);
router.put("/:id", verifyToken, isAdmin, updateEtudiant);
router.delete("/:id", verifyToken, isAdmin, deleteEtudiant);

// Routes d'inscription aux cours pour les étudiants
router.get("/courses/in-progress", verifyToken, isAccountActivated, isEtudiant, getCoursesInProgress);
router.get("/courses/completed", verifyToken, isAccountActivated, isEtudiant, getCompletedCourses);
router.get("/test-results", verifyToken, isAccountActivated, isEtudiant, getStudentTestResults);
router.get("/is-enrolled/:courseId", verifyToken, isAccountActivated, isEtudiant, checkEnrollmentStatus);
router.get("/has-completed/:courseId", verifyToken, isAccountActivated, isEtudiant, checkCompletionStatus);
router.post("/start-course", verifyToken, isAccountActivated, isEtudiant, startCourse);
router.post("/complete-course", verifyToken, isAccountActivated, isEtudiant, completeCourse);

export default router;