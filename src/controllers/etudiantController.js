import { db } from "../../config/db.js";

export const getAllEtudiants = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM etudiants");
  res.json(rows);
};

export const addEtudiant = async (req, res) => {
  const { fullname, email, classe_id } = req.body;

  await db.query(
    "INSERT INTO etudiants(fullname, email, classe_id) VALUES (?, ?, ?)",
    [fullname, email, classe_id]
  );

  res.json({ message: "Étudiant ajouté" });
};

export const updateEtudiant = async (req, res) => {
  const { fullname, email, classe_id } = req.body;

  await db.query(
    "UPDATE etudiants SET fullname = ?, email = ?, classe_id = ? WHERE id = ?",
    [fullname, email, classe_id, req.params.id]
  );

  res.json({ message: "Étudiant modifié" });
};

export const deleteEtudiant = async (req, res) => {
  await db.query("DELETE FROM etudiants WHERE id = ?", [req.params.id]);
  res.json({ message: "Étudiant supprimé" });
};
