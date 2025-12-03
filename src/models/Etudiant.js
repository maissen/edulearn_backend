import { db } from "../../config/db.js";

export default class Etudiant {
  static async findAll() {
    const [rows] = await db.query("SELECT * FROM etudiants");
    return rows;
  }

  static async create(data) {
    const { username, email, classe_id, isActivated = true } = data;
    await db.query(
      "INSERT INTO etudiants(username, email, classe_id, isActivated) VALUES (?, ?, ?, ?)",
      [username, email, classe_id, isActivated]
    );
  }

  static async update(id, data) {
    const { username, email, classe_id, isActivated } = data;
    let query = "UPDATE etudiants SET username = ?, email = ?, classe_id = ?";
    const params = [username, email, classe_id];
    
    if (isActivated !== undefined) {
      query += ", isActivated = ?";
      params.push(isActivated);
    }
    
    query += " WHERE id = ?";
    params.push(id);
    
    await db.query(query, params);
  }

  static async delete(id) {
    await db.query("DELETE FROM etudiants WHERE id = ?", [id]);
  }

  // Add method to find student by email
  static async findByEmail(email) {
    const [rows] = await db.query("SELECT * FROM etudiants WHERE email = ?", [email]);
    return rows[0];
  }
  
  // Add method to find student by email and check if activated
  static async findByEmailAndActivationStatus(email, isActivated = true) {
    const [rows] = await db.query("SELECT * FROM etudiants WHERE email = ? AND isActivated = ?", [email, isActivated]);
    return rows[0];
  }
}