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
  updateCoursWithTest
} from "../controllers/coursController.js";

import { verifyToken } from "../middlewares/authMiddleware.js";
import { optionalAuth } from "../middlewares/optionalAuthMiddleware.js";
import { isTeacherOrAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/", getAllCours);
router.get("/categories", getCourseCategories);
router.get("/grouped-by-category", getCoursesGroupedByCategory);
router.get("/:id", getCoursById);
// Use optional authentication so both authenticated and unauthenticated users can access course content
router.get("/:id/content", optionalAuth, getCourseContent);
router.get("/:id/related", getRelatedCourses);

router.post("/", verifyToken, isTeacherOrAdmin, createCours);
router.post("/with-test", verifyToken, isTeacherOrAdmin, createCoursWithTest);
router.put("/:id", verifyToken, isTeacherOrAdmin, updateCours);
router.put("/:id/with-test", verifyToken, isTeacherOrAdmin, updateCoursWithTest);
router.delete("/:id", verifyToken, isTeacherOrAdmin, deleteCours);

export default router;