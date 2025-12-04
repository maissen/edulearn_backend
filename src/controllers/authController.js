import { db } from "../../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register Student
export const registerStudent = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if student already exists in etudiants table
    const [existingStudent] = await db.query("SELECT * FROM etudiants WHERE email = ?", [email]);
    if (existingStudent.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Insert directly into etudiants table with default class and password
    await db.query(
      "INSERT INTO etudiants(username, email, password, classe_id, isActivated) VALUES (?, ?, ?, ?, ?)",
      [username, email, hashed, 1, true] // Default to class ID 1 and activated status true
    );

    res.json({ message: "Student registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Register Teacher
export const registerTeacher = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if teacher already exists in enseignants table
    const [existingTeacher] = await db.query("SELECT * FROM enseignants WHERE email = ?", [email]);
    if (existingTeacher.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Insert directly into enseignants table with password
    await db.query(
      "INSERT INTO enseignants(username, email, password, module, isActivated) VALUES (?, ?, ?, ?, ?)",
      [username, email, hashed, "General", true]
    );

    res.json({ message: "Teacher registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Register Admin
export const registerAdmin = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if admin already exists in admins table
    const [existingAdmin] = await db.query("SELECT * FROM admins WHERE email = ?", [email]);
    if (existingAdmin.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Insert directly into admins table
    await db.query(
      "INSERT INTO admins(username, email, password) VALUES (?, ?, ?)",
      [username, email, hashed]
    );

    res.json({ message: "Admin registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Helper function for login logic
const performLogin = async (req, res, tableName, role) => {
  const { email, password } = req.body;

  try {
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
        return res.status(500).json({ message: "Invalid table for login" });
    }

    const [rows] = await db.query(query, [email]);
    if (rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    user = rows[0];

    // Check if user is deactivated (admins don't have isActivated field)
    if (user.hasOwnProperty('isActivated') && user.isActivated === false) {
      return res.status(403).json({ message: "Account is deactivated. Please contact administrator." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const expiresIn = "70d";
    const token = jwt.sign({ id: user.id, email: user.email, role }, process.env.JWT_SECRET, {
      expiresIn
    });

    // Calculate expiration date (70 days from now)
    const expirationDate = Math.floor(Date.now() / 1000) + (70 * 24 * 60 * 60);

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