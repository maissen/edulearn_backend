import { db } from "../../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register Student
export const registerStudent = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const [user] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (user.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Insert into users table
    await db.query(
      "INSERT INTO users(username, email, password, role, biography) VALUES (?, ?, ?, ?, ?)",
      [username, email, hashed, "etudiant", null]
    );

    // Insert into etudiants table with default class
    await db.query(
      "INSERT INTO etudiants(username, email, classe_id) VALUES (?, ?, ?)",
      [username, email, 1] // Default to class ID 1
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
    const [user] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (user.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Insert into users table
    await db.query(
      "INSERT INTO users(username, email, password, role, biography) VALUES (?, ?, ?, ?, ?)",
      [username, email, hashed, "enseignant", null]
    );

    // Insert into enseignants table with default module
    await db.query(
      "INSERT INTO enseignants(username, email, module) VALUES (?, ?, ?)",
      [username, email, "General"]
    );

    res.json({ message: "Teacher registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Helper function for login logic
const performLogin = async (req, res, expectedRole) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = rows[0];

    // Verify role matches expected role
    if (user.role !== expectedRole) {
      return res.status(403).json({ 
        message: `Access denied. This endpoint is for ${expectedRole} only.` 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const expiresIn = "70d";
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
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
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login Student
export const loginStudent = async (req, res) => {
  await performLogin(req, res, "etudiant");
};

// Login Teacher
export const loginTeacher = async (req, res) => {
  await performLogin(req, res, "enseignant");
};

// Login Admin
export const loginAdmin = async (req, res) => {
  await performLogin(req, res, "admin");
};