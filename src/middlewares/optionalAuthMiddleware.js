// src/middlewares/optionalAuthMiddleware.js
import jwt from "jsonwebtoken";

// Optional authentication middleware - doesn't block unauthenticated requests
export const optionalAuth = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader?.split(" ")[1]; // retrieves token after "Bearer "

  if (!token) {
    // No token, continue without setting req.user
    return next();
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // contains { id, email, role }
  } catch (err) {
    // Invalid token, continue without setting req.user
    req.user = null;
  }
  
  next();
};