// src/middlewares/roleMiddleware.js

export const isTeacherOrAdmin = (req, res, next) => {
    if (!req.user || (req.user.role !== "enseignant" && req.user.role !== "admin")) {
        return res.status(403).json({
            message: "Accès refusé : vous n'avez pas la permission."
        });
    }
    next();
};

// Middleware spécifique pour les admins seulement
export const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            message: "Accès refusé : vous devez être administrateur."
        });
    }
    next();
};

// Middleware spécifique pour les étudiants seulement
export const isEtudiant = (req, res, next) => {
    if (!req.user || req.user.role !== "etudiant") {
        return res.status(403).json({
            message: "Accès refusé : vous devez être étudiant."
        });
    }
    next();
};