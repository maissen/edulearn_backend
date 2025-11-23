import { db } from "../../config/db.js";

export const getAllQuiz = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM quiz");
  res.json(rows);
};

export const createQuiz = async (req, res) => {
  const { titre, cours_id } = req.body;

  await db.query("INSERT INTO quiz(titre, cours_id) VALUES (?, ?)", [
    titre,
    cours_id
  ]);

  res.json({ message: "Quiz créé" });
};

export const deleteQuiz = async (req, res) => {
  await db.query("DELETE FROM quiz WHERE id = ?", [req.params.id]);
  res.json({ message: "Quiz supprimé" });
};
