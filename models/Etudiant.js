import { db } from "../../config/db.js";

export default class Etudiant {
  static async findAll() {
    const [rows] = await db.query("SELECT * FROM etudiants");
    return rows;
  }

  static async create(data) {
    const { fullname, email, classe_id } = data;
    await db.query(
      "INSERT INTO etudiants(fullname, email, classe_id) VALUES (?, ?, ?)",
      [fullname, email, classe_id]
    );
  }

  static async update(id, data) {
    const { fullname, email, classe_id } = data;
    await db.query(
      "UPDATE etudiants SET fullname = ?, email = ?, classe_id = ? WHERE id = ?",
      [fullname, email, classe_id, id]
    );
  }

  static async delete(id) {
    await db.query("DELETE FROM etudiants WHERE id = ?", [id]);
  }
}
