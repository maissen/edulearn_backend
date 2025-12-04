import express from "express";
import {
  getAllEnseignants,
  getTeacherTests,
  addEnseignant,
  updateEnseignant,
  deleteEnseignant
} from "../controllers/enseignantController.js";

import { verifyToken } from "../middlewares/authMiddleware.js";
import { isAccountActivated } from "../middlewares/activationMiddleware.js";
import { isAdmin, isTeacherOrAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/", getAllEnseignants);
router.get("/tests", verifyToken, isAccountActivated, isTeacherOrAdmin, getTeacherTests);
router.post("/", verifyToken, isAccountActivated, isAdmin, addEnseignant);
router.put("/:id", verifyToken, isAccountActivated, isAdmin, updateEnseignant);
router.delete("/:id", verifyToken, isAccountActivated, isAdmin, deleteEnseignant);

export default router;