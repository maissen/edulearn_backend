import { db } from "../../config/db.js";

export default class Classe {
  static async findAll() {
    const [rows] = await db.query("SELECT * FROM classes");
    return rows;
  }

  static async create(data) {
    const { nom, niveau } = data;
    await db.query(
      "INSERT INTO classes(nom, niveau) VALUES (?, ?)",
      [nom, niveau]
    );
  }

  static async update(id, data) {
    const { nom, niveau } = data;
    await db.query(
      "UPDATE classes SET nom = ?, niveau = ? WHERE id = ?",
      [nom, niveau, id]
    );
  }

  static async delete(id) {
    await db.query("DELETE FROM classes WHERE id = ?", [id]);
  }
}
