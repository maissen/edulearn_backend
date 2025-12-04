import express from "express";
import {
  getAllCours,
  getCoursById,
  getCourseCategories,
  getCoursesGroupedByCategory,
  getCourseContent,
  getRelatedCourses,
  createCours,
  createCoursWithTest,
  updateCours,
  deleteCours,
  updateCoursWithTest,
  getRecentCourses
} from "../controllers/coursController.js";

import { verifyToken } from "../middlewares/authMiddleware.js";
import { isAccountActivated } from "../middlewares/activationMiddleware.js";
import { optionalAuth } from "../middlewares/optionalAuthMiddleware.js";
import { isTeacherOrAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/", getAllCours);
router.get("/recent", getRecentCourses);
router.get("/categories", getCourseCategories);
router.get("/grouped-by-category", getCoursesGroupedByCategory);
router.get("/:id", getCoursById);
// Utiliser l'authentification optionnelle pour que les utilisateurs authentifiés et non authentifiés puissent accéder au contenu du cours
router.get("/:id/content", optionalAuth, getCourseContent);
router.get("/:id/related", getRelatedCourses);

router.post("/", verifyToken, isAccountActivated, isTeacherOrAdmin, createCours);
router.post("/with-test", verifyToken, isAccountActivated, isTeacherOrAdmin, createCoursWithTest);
router.put("/:id", verifyToken, isAccountActivated, isTeacherOrAdmin, updateCours);
router.put("/:id/with-test", verifyToken, isAccountActivated, isTeacherOrAdmin, updateCoursWithTest);
router.delete("/:id", verifyToken, isAccountActivated, isTeacherOrAdmin, deleteCours);

export default router;