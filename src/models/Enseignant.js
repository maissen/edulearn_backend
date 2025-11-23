import { db } from "../../config/db.js";

export default class Enseignant {
  static async findAll() {
    const [rows] = await db.query("SELECT * FROM enseignants");
    return rows;
  }

  static async create(data) {
    const { username, email, module } = data;
    await db.query(
      "INSERT INTO enseignants(username, email, module) VALUES (?, ?, ?)",
      [username, email, module]
    );
  }

  static async update(id, data) {
    const { username, email, module } = data;
    await db.query(
      "UPDATE enseignants SET username = ?, email = ?, module = ? WHERE id = ?",
      [username, email, module, id]
    );
  }

  static async delete(id) {
    await db.query("DELETE FROM enseignants WHERE id = ?", [id]);
  }
}
