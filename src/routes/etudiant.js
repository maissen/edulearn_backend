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
import { isAdmin, isEtudiant } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/", getAllEtudiants);
router.post("/", verifyToken, isAdmin, addEtudiant);
router.put("/:id", verifyToken, isAdmin, updateEtudiant);
router.delete("/:id", verifyToken, isAdmin, deleteEtudiant);

// Course enrollment routes for students
router.get("/courses/in-progress", verifyToken, isEtudiant, getCoursesInProgress);
router.get("/courses/completed", verifyToken, isEtudiant, getCompletedCourses);
router.get("/test-results", verifyToken, isEtudiant, getStudentTestResults);
router.get("/is-enrolled/:courseId", verifyToken, isEtudiant, checkEnrollmentStatus);
router.get("/has-completed/:courseId", verifyToken, isEtudiant, checkCompletionStatus);
router.post("/start-course", verifyToken, isEtudiant, startCourse);
router.post("/complete-course", verifyToken, isEtudiant, completeCourse);

export default router;
