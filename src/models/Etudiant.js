import { db } from "../../config/db.js";

export default class Etudiant {
  static async findAll() {
    const [rows] = await db.query("SELECT * FROM etudiants");
    return rows;
  }

  static async create(data) {
    const { username, email, classe_id } = data;
    await db.query(
      "INSERT INTO etudiants(username, email, classe_id) VALUES (?, ?, ?)",
      [username, email, classe_id]
    );
  }

  static async update(id, data) {
    const { username, email, classe_id } = data;
    await db.query(
      "UPDATE etudiants SET username = ?, email = ?, classe_id = ? WHERE id = ?",
      [username, email, classe_id, id]
    );
  }

  static async delete(id) {
    await db.query("DELETE FROM etudiants WHERE id = ?", [id]);
  }

  // Add method to find student by email
  static async findByEmail(email) {
    const [rows] = await db.query("SELECT * FROM etudiants WHERE email = ?", [email]);
    return rows[0];
  }
}