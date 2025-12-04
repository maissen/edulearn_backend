// src/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

export const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader?.split(" ")[1]; // récupère le token après "Bearer "

  if (!token) {
    logger.warn('Access denied - missing token', { ip: req.ip, url: req.originalUrl });
    return res.status(401).json({ message: "Accès refusé. Token manquant." });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // contient { id, email, role }
    logger.info('Token verified successfully', { userId: verified.id, role: verified.role, url: req.originalUrl });
    next();
  } catch (err) {
    logger.warn('Invalid token', { error: err.message, ip: req.ip, url: req.originalUrl });
    res.status(400).json({ message: "Token invalide." });
  }
};