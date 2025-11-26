import { db } from "../../config/db.js";

export default class Cours {
  static async findAll() {
    const [rows] = await db.query("SELECT * FROM cours");
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query("SELECT * FROM cours WHERE id = ?", [id]);
    return rows[0];
  }

  static async create(data) {
    const { titre, description, category, youtube_vd_url, enseignant_id } = data;
    await db.query(
      "INSERT INTO cours(titre, description, category, youtube_vd_url, enseignant_id) VALUES (?, ?, ?, ?, ?)",
      [titre, description, category, youtube_vd_url, enseignant_id]
    );
  }

  static async update(id, data) {
    const { titre, description, category, youtube_vd_url } = data;
    await db.query(
      "UPDATE cours SET titre = ?, description = ?, category = ?, youtube_vd_url = ? WHERE id = ?",
      [titre, description, category, youtube_vd_url, id]
    );
  }

  static async delete(id) {
    await db.query("DELETE FROM cours WHERE id = ?", [id]);
  }
}
