import express from "express";
import {
  getAllEnseignants,
  addEnseignant,
  updateEnseignant,
  deleteEnseignant
} from "../controllers/enseignantController.js";

import { verifyToken } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/", getAllEnseignants);
router.post("/", verifyToken, isAdmin, addEnseignant);
router.put("/:id", verifyToken, isAdmin, updateEnseignant);
router.delete("/:id", verifyToken, isAdmin, deleteEnseignant);

export default router;
