import express from "express";
import {
  getAllEtudiants,
  addEtudiant,
  updateEtudiant,
  deleteEtudiant
} from "../controllers/etudiantController.js";

import { verifyToken } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/", getAllEtudiants);
router.post("/", verifyToken, isAdmin, addEtudiant);
router.put("/:id", verifyToken, isAdmin, updateEtudiant);
router.delete("/:id", verifyToken, isAdmin, deleteEtudiant);

export default router;
