// src/middlewares/roleMiddleware.js

export const isTeacherOrAdmin = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Accès refusé : vous n'avez pas la permission."
            });
        }
        next();
    };
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
