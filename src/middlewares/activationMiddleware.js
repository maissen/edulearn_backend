// src/middlewares/activationMiddleware.js
import { db } from "../../config/db.js";

// Middleware to check if user account is activated
export const isAccountActivated = async (req, res, next) => {
  try {
    const { id, role } = req.user;
    
    // Admins don't have activation status
    if (role === "admin") {
      return next();
    }
    
    let query = "";
    switch (role) {
      case "enseignant":
        query = "SELECT isActivated FROM enseignants WHERE id = ?";
        break;
      case "etudiant":
        query = "SELECT isActivated FROM etudiants WHERE id = ?";
        break;
      default:
        return res.status(403).json({ message: "Invalid user role" });
    }
    
    const [rows] = await db.query(query, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const user = rows[0];
    if (!user.isActivated) {
      return res.status(403).json({ message: "Account is deactivated. Please contact administrator." });
    }
    
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};