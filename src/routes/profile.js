import express from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { isAccountActivated } from "../middlewares/activationMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, isAccountActivated, getProfile);
router.put("/", verifyToken, isAccountActivated, updateProfile);

export default router;
