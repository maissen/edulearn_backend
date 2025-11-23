import express from "express";
import {
  getAllExamens,
  addExamen,
  updateExamen,
  deleteExamen
} from "../controllers/examenController.js";

import { verifyToken } from "../middlewares/authMiddleware.js";
import { isTeacherOrAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/", getAllExamens);
router.post("/", verifyToken, isTeacherOrAdmin, addExamen);
router.put("/:id", verifyToken, isTeacherOrAdmin, updateExamen);
router.delete("/:id", verifyToken, isTeacherOrAdmin, deleteExamen);

export default router;
