import express from "express";
import {
  getAllCours,
  getCoursById,
  getCourseCategories,
  createCours,
  updateCours,
  deleteCours
} from "../controllers/coursController.js";

import { verifyToken } from "../middlewares/authMiddleware.js";
import { isTeacherOrAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/", getAllCours);
router.get("/categories", getCourseCategories);
router.get("/:id", getCoursById);

router.post("/", verifyToken, isTeacherOrAdmin, createCours);
router.put("/:id", verifyToken, isTeacherOrAdmin, updateCours);
router.delete("/:id", verifyToken, isTeacherOrAdmin, deleteCours);

export default router;
