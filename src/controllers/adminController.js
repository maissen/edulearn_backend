import { db } from "../../config/db.js";

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

// Get all teachers with activation status
export const getAllTeachersWithActivationStatus = async (req, res) => {
  try {
    const [teachers] = await db.query("SELECT id, username, email, module, isActivated FROM enseignants");
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all students with activation status
export const getAllStudentsWithActivationStatus = async (req, res) => {
  try {
    const [students] = await db.query("SELECT id, username, email, classe_id, isActivated FROM etudiants");
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};