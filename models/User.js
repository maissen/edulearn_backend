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
    const { fullname, email, password, role } = user;

    await db.query(
      "INSERT INTO users(fullname, email, password, role) VALUES (?, ?, ?, ?)",
      [fullname, email, password, role]
    );

    return true;
  }
}
