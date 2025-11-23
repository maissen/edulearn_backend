import { db } from "../../config/db.js";

export default class User {
  static async findByEmail(email) {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0];
  }

  static async create(user) {
    const { username, email, password, role } = user;

    await db.query(
      "INSERT INTO users(username, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email, password, role]
    );

    return true;
  }
}
