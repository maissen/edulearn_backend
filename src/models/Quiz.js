import { db } from "../../config/db.js";

export default class Quiz {
  static async findAll() {
    const [rows] = await db.query("SELECT * FROM quiz");
    return rows;
  }

  static async create(data) {
    const { titre, cours_id } = data;
    await db.query("INSERT INTO quiz(titre, cours_id) VALUES (?, ?)", [
      titre,
      cours_id
    ]);
  }

  static async delete(id) {
    await db.query("DELETE FROM quiz WHERE id = ?", [id]);
  }
}
