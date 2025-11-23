import { db } from "../../config/db.js";

export default class Examen {
  static async findAll() {
    const [rows] = await db.query("SELECT * FROM examens");
    return rows;
  }

  static async create(data) {
    const { titre, classe_id, date } = data;
    await db.query(
      "INSERT INTO examens(titre, classe_id, date) VALUES (?, ?, ?)",
      [titre, classe_id, date]
    );
  }

  static async update(id, data) {
    const { titre, classe_id, date } = data;
    await db.query(
      "UPDATE examens SET titre = ?, classe_id = ?, date = ? WHERE id = ?",
      [titre, classe_id, date, id]
    );
  }

  static async delete(id) {
    await db.query("DELETE FROM examens WHERE id = ?", [id]);
  }
}
