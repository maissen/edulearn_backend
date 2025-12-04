import { db } from "../../config/db.js";
import bcrypt from "bcryptjs";

// Get all users (admins, teachers, students) with all details
export const getAllUsers = async (req, res) => {
  try {
    // Fetch all admins
    const [admins] = await db.query("SELECT id, username, email, created_at, updated_at FROM admins");
    
    // Fetch all teachers
    const [teachers] = await db.query("SELECT id, username, email, module, biography, isActivated, created_at, updated_at FROM enseignants");
    
    // Fetch all students
    const [students] = await db.query("SELECT id, username, email, classe_id, biography, isActivated, created_at, updated_at FROM etudiants");
    
    // Return categorized response
    res.json({
      admins: admins,
      teachers: teachers,
      students: students
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Toggle activation status for a teacher
export const toggleTeacherActivation = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActivated } = req.body;

    // Check if teacher exists
    const [teacher] = await db.query("SELECT * FROM enseignants WHERE id = ?", [id]);
    if (teacher.length === 0) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Update activation status
    await db.query("UPDATE enseignants SET isActivated = ? WHERE id = ?", [isActivated, id]);

    res.json({ 
      message: `Teacher ${isActivated ? 'activated' : 'deactivated'} successfully`,
      isActivated: isActivated
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Toggle activation status for a student
export const toggleStudentActivation = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActivated } = req.body;

    // Check if student exists
    const [student] = await db.query("SELECT * FROM etudiants WHERE id = ?", [id]);
    if (student.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Update activation status
    await db.query("UPDATE etudiants SET isActivated = ? WHERE id = ?", [isActivated, id]);

    res.json({ 
      message: `Student ${isActivated ? 'activated' : 'deactivated'} successfully`,
      isActivated: isActivated
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new teacher account
export const createTeacher = async (req, res) => {
  try {
    const { username, email, password, module } = req.body;

    // Check if teacher already exists
    const [existingTeacher] = await db.query("SELECT * FROM enseignants WHERE email = ?", [email]);
    if (existingTeacher.length > 0) {
      return res.status(400).json({ message: "Teacher with this email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new teacher
    const [result] = await db.query(
      "INSERT INTO enseignants (username, email, password, module, isActivated) VALUES (?, ?, ?, ?, ?)",
      [username, email, hashedPassword, module || "General", true]
    );

    // Fetch the newly created teacher
    const [newTeacher] = await db.query(
      "SELECT id, username, email, module, isActivated, created_at, updated_at FROM enseignants WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({ 
      message: "Teacher account created successfully",
      teacher: newTeacher[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new student account
export const createStudent = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if student already exists
    const [existingStudent] = await db.query("SELECT * FROM etudiants WHERE email = ?", [email]);
    if (existingStudent.length > 0) {
      return res.status(400).json({ message: "Student with this email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // For student creation, we'll assign them to the first available class (class ID 1 as default)
    const [result] = await db.query(
      "INSERT INTO etudiants (username, email, password, classe_id, isActivated) VALUES (?, ?, ?, ?, ?)",
      [username, email, hashedPassword, 1, true]
    );

    // Fetch the newly created student
    const [newStudent] = await db.query(
      "SELECT id, username, email, classe_id, isActivated, created_at, updated_at FROM etudiants WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({ 
      message: "Student account created successfully",
      student: newStudent[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};