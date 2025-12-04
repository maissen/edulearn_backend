import express from "express";
import { 
  getAllUsers,
  getStatistics,
  toggleTeacherActivation,
  toggleStudentActivation,
  createTeacher,
  createStudent,
  createAdmin,
  deleteTeacher,
  deleteStudent,
  getAllTeacherCourses,
  deleteCourse
} from "../controllers/adminController.js";
import { getLogs, getLogStats, exportLogsCSV, clearLogs } from "../controllers/logController.js";
import { createBackup, listBackups, downloadBackup, deleteBackup } from "../controllers/backupController.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Obtenir tous les utilisateurs (administrateurs, enseignants, étudiants) avec tous les détails (administrateur uniquement)
router.get("/users", verifyToken, isAdmin, getAllUsers);

// Obtenir les statistiques (administrateur uniquement)
router.get("/statistics", verifyToken, isAdmin, getStatistics);

// Obtenir tous les cours des enseignants avec tous les détails (administrateur uniquement)
router.get("/teacher-courses", verifyToken, isAdmin, getAllTeacherCourses);

// Basculer le statut d'activation de l'enseignant (administrateur uniquement)
router.patch("/teachers/:id/activation", verifyToken, isAdmin, toggleTeacherActivation);

// Basculer le statut d'activation de l'étudiant (administrateur uniquement)
router.patch("/students/:id/activation", verifyToken, isAdmin, toggleStudentActivation);

// Créer un nouveau compte enseignant (administrateur uniquement)
router.post("/teachers", verifyToken, isAdmin, createTeacher);

// Créer un nouveau compte étudiant (administrateur uniquement)
router.post("/students", verifyToken, isAdmin, createStudent);

// Créer un nouveau compte administrateur (administrateur uniquement)
router.post("/admins", verifyToken, isAdmin, createAdmin);

// Supprimer un compte enseignant et toutes les données associées (administrateur uniquement)
router.delete("/teachers/:id", verifyToken, isAdmin, deleteTeacher);

// Supprimer un compte étudiant et toutes les données associées (administrateur uniquement)
router.delete("/students/:id", verifyToken, isAdmin, deleteStudent);

// Supprimer un cours et toutes les données associées (administrateur uniquement)
router.delete("/courses/:id", verifyToken, isAdmin, deleteCourse);

// Obtenir les journaux (administrateur uniquement)
router.get("/logs", verifyToken, isAdmin, getLogs);

// Effacer tous les journaux (administrateur uniquement)
router.delete("/logs", verifyToken, isAdmin, clearLogs);

// Obtenir les statistiques des journaux (administrateur uniquement)
router.get("/log-stats", verifyToken, isAdmin, getLogStats);

// Exporter les journaux au format CSV (administrateur uniquement)
router.get("/logs/export", verifyToken, isAdmin, exportLogsCSV);

// Créer une sauvegarde de la base de données (administrateur uniquement)
router.post("/backup", verifyToken, isAdmin, createBackup);

// Lister les sauvegardes disponibles (administrateur uniquement)
router.get("/backups", verifyToken, isAdmin, listBackups);

// Télécharger un fichier de sauvegarde (administrateur uniquement)
router.get("/backups/:filename", verifyToken, isAdmin, downloadBackup);

// Supprimer un fichier de sauvegarde (administrateur uniquement)
router.delete("/backups/:filename", verifyToken, isAdmin, deleteBackup);

export default router;