import express from "express";
import { 
  registerStudent, 
  registerTeacher, 
  loginStudent, 
  loginTeacher, 
  loginAdmin 
} from "../controllers/authController.js";

const router = express.Router();

// Registration routes
router.post("/register/student", registerStudent);
router.post("/register/teacher", registerTeacher);

// Login routes
router.post("/login/student", loginStudent);
router.post("/login/teacher", loginTeacher);
router.post("/login/admin", loginAdmin);

export default router;
