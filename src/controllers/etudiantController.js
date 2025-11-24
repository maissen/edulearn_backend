import { db } from "../../config/db.js";
import StudentEnrollment from "../../models/StudentEnrollment.js";

export const getAllEtudiants = async (req, res) => {
  const [rows] = await db.query("SELECT id, username, email, classe_id FROM etudiants");
  res.json(rows);
};

export const addEtudiant = async (req, res) => {
  const { username, email, classe_id } = req.body;

  await db.query(
    "INSERT INTO etudiants(username, email, classe_id) VALUES (?, ?, ?)",
    [username, email, classe_id]
  );

  res.json({ message: "Étudiant ajouté" });
};

export const updateEtudiant = async (req, res) => {
  const { username, email, classe_id } = req.body;

  await db.query(
    "UPDATE etudiants SET username = ?, email = ?, classe_id = ? WHERE id = ?",
    [username, email, classe_id, req.params.id]
  );

  res.json({ message: "Étudiant modifié" });
};

export const deleteEtudiant = async (req, res) => {
  await db.query("DELETE FROM etudiants WHERE id = ?", [req.params.id]);
  res.json({ message: "Étudiant supprimé" });
};

// Course enrollment endpoints for students
export const startCourse = async (req, res) => {
  try {
    const { coursId } = req.body;
    const etudiantId = req.user.id; // From auth middleware

    const result = await StudentEnrollment.enrollStudent(etudiantId, coursId);
    res.json(result);
  } catch (error) {
    console.error('Error starting course:', error);
    res.status(400).json({ error: error.message });
  }
};

export const completeCourse = async (req, res) => {
  try {
    const { coursId } = req.body;
    const etudiantId = req.user.id; // From auth middleware

    const result = await StudentEnrollment.completeCourse(etudiantId, coursId);
    res.json(result);
  } catch (error) {
    console.error('Error completing course:', error);
    res.status(400).json({ error: error.message });
  }
};
