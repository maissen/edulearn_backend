import { db } from "../../config/db.js";

export const getAllExamens = async (req, res) => {
  const [rows] = await db.query("SELECT id, titre, cours_id as classe_id, created_at as date FROM test");
  res.json(rows);
};

export const addExamen = async (req, res) => {
  const { titre, classe_id, date } = req.body;

  await db.query(
    "INSERT INTO test(titre, cours_id, created_at) VALUES (?, ?, ?)",
    [titre, classe_id, date]
  );

  res.json({ message: "Examen ajouté" });
};

export const updateExamen = async (req, res) => {
  const { titre, classe_id, date } = req.body;

  await db.query(
    "UPDATE test SET titre = ?, cours_id = ?, created_at = ? WHERE id = ?",
    [titre, classe_id, date, req.params.id]
  );

  res.json({ message: "Examen modifié" });
};

export const deleteExamen = async (req, res) => {
  await db.query("DELETE FROM test WHERE id = ?", [req.params.id]);
  res.json({ message: "Examen supprimé" });
};
