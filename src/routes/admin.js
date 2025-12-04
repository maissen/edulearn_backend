import express from "express";
import { 
  getAllUsers
} from "../controllers/adminController.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get all users (admins, teachers, students) with all details (admin only)
router.get("/users", verifyToken, isAdmin, getAllUsers);

export default router;