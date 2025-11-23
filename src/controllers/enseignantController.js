import { db } from "../../config/db.js";
import { isTeacherOrAdmin } from "../middlewares/roleMiddleware.js";


export const getAllEnseignants = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM enseignants");
  res.json(rows);
};

export const addEnseignant = async (req, res) => {
  const { fullname, email, module } = req.body;

  await db.query(
    "INSERT INTO enseignants(fullname, email, module) VALUES (?, ?, ?)",
    [fullname, email, module]
  );

  res.json({ message: "Enseignant ajouté" });
};

export const updateEnseignant = async (req, res) => {
  const { fullname, email, module } = req.body;

  await db.query(
    "UPDATE enseignants SET fullname = ?, email = ?, module = ? WHERE id = ?",
    [fullname, email, module, req.params.id]
  );

  res.json({ message: "Enseignant modifié" });
};

export const deleteEnseignant = async (req, res) => {
  await db.query("DELETE FROM enseignants WHERE id = ?", [req.params.id]);
  res.json({ message: "Enseignant supprimé" });
};
