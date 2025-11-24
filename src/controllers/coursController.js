import { db } from "../../config/db.js";

export const getAllCours = async (req, res) => {
  const [rows] = await db.query("SELECT id, titre, description, category, enseignant_id FROM cours");
  res.json(rows);
};

export const getCourseCategories = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT DISTINCT category FROM cours WHERE category IS NOT NULL AND category != '' ORDER BY category"
    );
    const categories = rows.map(row => row.category);
    res.json(categories);
  } catch (error) {
    console.error('Error fetching course categories:', error);
    res.status(500).json({ error: 'Failed to fetch course categories' });
  }
};

export const getCoursById = async (req, res) => {
  const [rows] = await db.query("SELECT id, titre, description, category, enseignant_id FROM cours WHERE id = ?", [req.params.id]);
  res.json(rows[0]);
};

export const createCours = async (req, res) => {
  const { titre, description, category, enseignant_id } = req.body;

  await db.query(
    "INSERT INTO cours(titre, description, category, enseignant_id) VALUES (?, ?, ?, ?)",
    [titre, description, category, enseignant_id]
  );

  res.json({ message: "Cours ajouté" });
};

export const updateCours = async (req, res) => {
  const { titre, description, category } = req.body;

  await db.query(
    "UPDATE cours SET titre = ?, description = ?, category = ? WHERE id = ?",
    [titre, description, category, req.params.id]
  );

  res.json({ message: "Cours modifié" });
};

export const deleteCours = async (req, res) => {
  await db.query("DELETE FROM cours WHERE id = ?", [req.params.id]);
  res.json({ message: "Cours supprimé" });
};
