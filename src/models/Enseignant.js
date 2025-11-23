import { db } from "../../config/db.js";

export default class Enseignant {
  static async findAll() {
    const [rows] = await db.query("SELECT * FROM enseignants");
    return rows;
  }

  static async create(data) {
    const { fullname, email, module } = data;
    await db.query(
      "INSERT INTO enseignants(fullname, email, module) VALUES (?, ?, ?)",
      [fullname, email, module]
    );
  }

  static async update(id, data) {
    const { fullname, email, module } = data;
    await db.query(
      "UPDATE enseignants SET fullname = ?, email = ?, module = ? WHERE id = ?",
      [fullname, email, module, id]
    );
  }

  static async delete(id) {
    await db.query("DELETE FROM enseignants WHERE id = ?", [id]);
  }
}
