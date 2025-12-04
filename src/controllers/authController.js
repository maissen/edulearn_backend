import { db } from "../../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

// Register Student
export const registerStudent = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    logger.info('Tentative d\'inscription d\'un étudiant', { email });
    
    // Check if student already exists in etudiants table
    const [existingStudent] = await db.query("SELECT * FROM etudiants WHERE email = ?", [email]);
    if (existingStudent.length > 0) {
      logger.warn('Échec de l\'inscription de l\'étudiant - email déjà existant', { email });
      return res.status(400).json({ message: "L'email existe déjà" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Insert directly into etudiants table with default class and password
    await db.query(
      "INSERT INTO etudiants(username, email, password, classe_id, isActivated) VALUES (?, ?, ?, ?, ?)",
      [username, email, hashed, 1, true] // Default to class ID 1 and activated status true
    );

    logger.info('Étudiant inscrit avec succès', { email, username });
    res.json({ message: "Étudiant inscrit avec succès" });
  } catch (err) {
    logger.error('Erreur lors de l\'inscription de l\'étudiant', { error: err.message, stack: err.stack });
    res.status(500).json({ error: err.message });
  }
};

// Register Teacher
export const registerTeacher = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    logger.info('Tentative d\'inscription d\'un enseignant', { email });
    
    // Check if teacher already exists in enseignants table
    const [existingTeacher] = await db.query("SELECT * FROM enseignants WHERE email = ?", [email]);
    if (existingTeacher.length > 0) {
      logger.warn('Échec de l\'inscription de l\'enseignant - email déjà existant', { email });
      return res.status(400).json({ message: "L'email existe déjà" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Insert directly into enseignants table with password
    await db.query(
      "INSERT INTO enseignants(username, email, password, module, isActivated) VALUES (?, ?, ?, ?, ?)",
      [username, email, hashed, "General", true]
    );

    logger.info('Enseignant inscrit avec succès', { email, username });
    res.json({ message: "Enseignant inscrit avec succès" });
  } catch (err) {
    logger.error('Erreur lors de l\'inscription de l\'enseignant', { error: err.message, stack: err.stack });
    res.status(500).json({ error: err.message });
  }
};

// Register Admin
export const registerAdmin = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    logger.info('Tentative d\'inscription d\'un administrateur', { email });
    
    // Check if admin already exists in admins table
    const [existingAdmin] = await db.query("SELECT * FROM admins WHERE email = ?", [email]);
    if (existingAdmin.length > 0) {
      logger.warn('Échec de l\'inscription de l\'administrateur - email déjà existant', { email });
      return res.status(400).json({ message: "L'email existe déjà" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Insert directly into admins table
    await db.query(
      "INSERT INTO admins(username, email, password) VALUES (?, ?, ?)",
      [username, email, hashed]
    );

    logger.info('Administrateur inscrit avec succès', { email, username });
    res.json({ message: "Administrateur inscrit avec succès" });
  } catch (err) {
    logger.error('Erreur lors de l\'inscription de l\'administrateur', { error: err.message, stack: err.stack });
    res.status(500).json({ error: err.message });
  }
};

// Helper function for login logic
const performLogin = async (req, res, tableName, role) => {
  const { email, password } = req.body;

  try {
    logger.info(`Tentative de connexion ${role}`, { email, role });
    
    let user = null;
    let query = "";

    // Determine which table to query based on role
    switch (tableName) {
      case "etudiants":
        query = "SELECT id, username, email, password, isActivated FROM etudiants WHERE email = ?";
        break;
      case "enseignants":
        query = "SELECT id, username, email, password, isActivated FROM enseignants WHERE email = ?";
        break;
      case "admins":
        query = "SELECT id, username, email, password FROM admins WHERE email = ?";
        break;
      default:
        logger.error('Table invalide pour la connexion', { tableName });
        return res.status(500).json({ message: "Table invalide pour la connexion" });
    }

    const [rows] = await db.query(query, [email]);
    if (rows.length === 0) {
      logger.warn('Échec de la connexion - utilisateur non trouvé', { email, role });
      return res.status(400).json({ message: "Utilisateur non trouvé" });
    }

    user = rows[0];

    // Check if user is deactivated (admins don't have isActivated field)
    if (user.hasOwnProperty('isActivated') && user.isActivated === false) {
      logger.warn('Échec de la connexion - compte désactivé', { email, role });
      return res.status(403).json({ message: "Le compte est désactivé. Veuillez contacter l'administrateur." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn('Échec de la connexion - identifiants invalides', { email, role });
      return res.status(400).json({ message: "Identifiants invalides" });
    }

    const expiresIn = "70d";
    const token = jwt.sign({ id: user.id, email: user.email, role }, process.env.JWT_SECRET, {
      expiresIn
    });

    // Calculate expiration date (70 days from now)
    const expirationDate = Math.floor(Date.now() / 1000) + (70 * 24 * 60 * 60);

    logger.info(`Connexion ${role} réussie`, { email, userId: user.id, role });
    res.json({ 
      token, 
      expiration_date: expirationDate,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: role
      }
    });
  } catch (err) {
    logger.error(`Erreur de connexion ${role}`, { error: err.message, stack: err.stack });
    res.status(500).json({ error: err.message });
  }
};

// Login Student
export const loginStudent = async (req, res) => {
  await performLogin(req, res, "etudiants", "etudiant");
};

// Login Teacher
export const loginTeacher = async (req, res) => {
  await performLogin(req, res, "enseignants", "enseignant");
};

// Login Admin
export const loginAdmin = async (req, res) => {
  await performLogin(req, res, "admins", "admin");
};