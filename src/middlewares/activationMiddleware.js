// src/middlewares/activationMiddleware.js
import { db } from "../../config/db.js";
import logger from "../utils/logger.js";

// Middleware to check if user account is activated
export const isAccountActivated = async (req, res, next) => {
  try {
    const { id, role } = req.user;
    
    logger.info('Vérification du statut d\'activation du compte', { userId: id, role });
    
    // Admins don't have activation status
    if (role === "admin") {
      logger.debug('Utilisateur administrateur contournant la vérification d\'activation', { userId: id });
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
        logger.warn('Rôle utilisateur invalide pour la vérification d\'activation', { userId: id, role });
        return res.status(403).json({ message: "Rôle utilisateur invalide" });
    }
    
    const [rows] = await db.query(query, [id]);
    if (rows.length === 0) {
      logger.warn('Utilisateur non trouvé lors de la vérification d\'activation', { userId: id, role });
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    const user = rows[0];
    if (!user.isActivated) {
      logger.warn('Compte désactivé', { userId: id, role });
      return res.status(403).json({ message: "Le compte est désactivé. Veuillez contacter l'administrateur." });
    }
    
    logger.info('Le compte est activé', { userId: id, role });
    next();
  } catch (err) {
    logger.error('Erreur lors de la vérification de l\'activation du compte', { error: err.message, stack: err.stack, userId: req.user?.id, role: req.user?.role });
    res.status(500).json({ error: err.message });
  }
};