import { db } from "../../config/db.js";

export const getAllClasses = async (req, res) => {
  const [rows] = await db.query("SELECT id, nom, niveau FROM classes");
  res.json(rows);
};

export const addClasse = async (req, res) => {
  const { nom, niveau } = req.body;

  await db.query("INSERT INTO classes(nom, niveau) VALUES (?, ?)", [nom, niveau]);

  res.json({ message: "Classe ajoutée" });
};

export const updateClasse = async (req, res) => {
  const { nom, niveau } = req.body;

  await db.query(
    "UPDATE classes SET nom = ?, niveau = ? WHERE id = ?",
    [nom, niveau, req.params.id]
  );

  res.json({ message: "Classe modifiée" });
};

export const deleteClasse = async (req, res) => {
  await db.query("DELETE FROM classes WHERE id = ?", [req.params.id]);
  res.json({ message: "Classe supprimée" });
};
