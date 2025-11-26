// src/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader?.split(" ")[1]; // récupère le token après "Bearer "

  if (!token) {
    return res.status(401).json({ message: "Accès refusé. Token manquant." });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // contient { id, email, role }
    next();
  } catch (err) {
    res.status(400).json({ message: "Token invalide." });
  }
};