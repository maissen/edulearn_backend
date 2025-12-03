import { db } from "../../config/db.js";

export default class Enseignant {
  static async findAll() {
    const [rows] = await db.query("SELECT * FROM enseignants");
    return rows;
  }

  static async create(data) {
    const { username, email, module, isActivated = true } = data;
    await db.query(
      "INSERT INTO enseignants(username, email, module, isActivated) VALUES (?, ?, ?, ?)",
      [username, email, module, isActivated]
    );
  }

  static async update(id, data) {
    const { username, email, module, isActivated } = data;
    let query = "UPDATE enseignants SET username = ?, email = ?, module = ?";
    const params = [username, email, module];
    
    if (isActivated !== undefined) {
      query += ", isActivated = ?";
      params.push(isActivated);
    }
    
    query += " WHERE id = ?";
    params.push(id);
    
    await db.query(query, params);
  }

  static async delete(id) {
    await db.query("DELETE FROM enseignants WHERE id = ?", [id]);
  }
}
