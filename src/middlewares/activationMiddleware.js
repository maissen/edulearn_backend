// src/middlewares/activationMiddleware.js
import { db } from "../../config/db.js";
import logger from "../utils/logger.js";

// Middleware to check if user account is activated
export const isAccountActivated = async (req, res, next) => {
  try {
    const { id, role } = req.user;
    
    logger.info('Checking account activation status', { userId: id, role });
    
    // Admins don't have activation status
    if (role === "admin") {
      logger.debug('Admin user bypassing activation check', { userId: id });
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
        logger.warn('Invalid user role for activation check', { userId: id, role });
        return res.status(403).json({ message: "Invalid user role" });
    }
    
    const [rows] = await db.query(query, [id]);
    if (rows.length === 0) {
      logger.warn('User not found during activation check', { userId: id, role });
      return res.status(404).json({ message: "User not found" });
    }
    
    const user = rows[0];
    if (!user.isActivated) {
      logger.warn('Account deactivated', { userId: id, role });
      return res.status(403).json({ message: "Account is deactivated. Please contact administrator." });
    }
    
    logger.info('Account is activated', { userId: id, role });
    next();
  } catch (err) {
    logger.error('Error checking account activation', { error: err.message, stack: err.stack, userId: req.user?.id, role: req.user?.role });
    res.status(500).json({ error: err.message });
  }
};