// src/middlewares/optionalAuthMiddleware.js
import jwt from "jsonwebtoken";

// Middleware d'authentification optionnel - ne bloque pas les requêtes non authentifiées
export const optionalAuth = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader?.split(" ")[1]; // récupère le token après "Bearer "

  if (!token) {
    // Pas de token, continuer sans définir req.user
    return next();
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // contient { id, email, role }
  } catch (err) {
    // Token invalide, continuer sans définir req.user
    req.user = null;
  }
  
  next();
};