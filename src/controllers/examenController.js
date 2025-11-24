import { db } from "../../config/db.js";

export const getAllExamens = async (req, res) => {
  const [rows] = await db.query("SELECT id, titre, classe_id, date FROM examens");
  res.json(rows);
};

export const addExamen = async (req, res) => {
  const { titre, classe_id, date } = req.body;

  await db.query(
    "INSERT INTO examens(titre, classe_id, date) VALUES (?, ?, ?)",
    [titre, classe_id, date]
  );

  res.json({ message: "Examen ajouté" });
};

export const updateExamen = async (req, res) => {
  const { titre, classe_id, date } = req.body;

  await db.query(
    "UPDATE examens SET titre = ?, classe_id = ?, date = ? WHERE id = ?",
    [titre, classe_id, date, req.params.id]
  );

  res.json({ message: "Examen modifié" });
};

export const deleteExamen = async (req, res) => {
  await db.query("DELETE FROM examens WHERE id = ?", [req.params.id]);
  res.json({ message: "Examen supprimé" });
};
