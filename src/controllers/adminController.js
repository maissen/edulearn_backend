import { db } from "../../config/db.js";

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