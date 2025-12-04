import express from "express";
import { 
  registerStudent, 
  registerTeacher, 
  registerAdmin,
  loginStudent, 
  loginTeacher, 
  loginAdmin 
} from "../controllers/authController.js";

const router = express.Router();

// Routes d'inscription
router.post("/register/student", registerStudent);
router.post("/register/teacher", registerTeacher);
router.post("/register/admin", registerAdmin);

// Routes de connexion
router.post("/login/student", loginStudent);
router.post("/login/teacher", loginTeacher);
router.post("/login/admin", loginAdmin);

export default router;