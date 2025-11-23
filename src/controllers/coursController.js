import { db } from "../../config/db.js";

export const getAllCours = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM cours");
  res.json(rows);
};

export const getCoursById = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM cours WHERE id = ?", [req.params.id]);
  res.json(rows[0]);
};

export const createCours = async (req, res) => {
  const { titre, description, enseignant_id } = req.body;

  await db.query(
    "INSERT INTO cours(titre, description, enseignant_id) VALUES (?, ?, ?)",
    [titre, description, enseignant_id]
  );

  res.json({ message: "Cours ajouté" });
};

export const updateCours = async (req, res) => {
  const { titre, description } = req.body;

  await db.query(
    "UPDATE cours SET titre = ?, description = ? WHERE id = ?",
    [titre, description, req.params.id]
  );

  res.json({ message: "Cours modifié" });
};

export const deleteCours = async (req, res) => {
  await db.query("DELETE FROM cours WHERE id = ?", [req.params.id]);
  res.json({ message: "Cours supprimé" });
};
