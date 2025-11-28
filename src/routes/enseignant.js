import express from "express";
import {
  getAllEnseignants,
  getTeacherTests,
  addEnseignant,
  updateEnseignant,
  deleteEnseignant
} from "../controllers/enseignantController.js";

import { verifyToken } from "../middlewares/authMiddleware.js";
import { isAdmin, isTeacherOrAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/", getAllEnseignants);
router.get("/tests", verifyToken, isTeacherOrAdmin, getTeacherTests);
router.post("/", verifyToken, isAdmin, addEnseignant);
router.put("/:id", verifyToken, isAdmin, updateEnseignant);
router.delete("/:id", verifyToken, isAdmin, deleteEnseignant);

export default router;