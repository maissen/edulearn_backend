import express from "express";
import {
  getAllClasses,
  addClasse,
  updateClasse,
  deleteClasse
} from "../controllers/classeController.js";

import { verifyToken } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/", getAllClasses);
router.post("/", verifyToken, isAdmin, addClasse);
router.put("/:id", verifyToken, isAdmin, updateClasse);
router.delete("/:id", verifyToken, isAdmin, deleteClasse);

export default router;
