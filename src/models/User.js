import { db } from "../../config/db.js";

export default class User {
  // Find user by email across all user tables
  static async findByEmail(email) {
    // Check admins table first
    let [rows] = await db.query("SELECT *, 'admin' as role FROM admins WHERE email = ?", [email]);
    if (rows.length > 0) return rows[0];

    // Check enseignants table
    [rows] = await db.query("SELECT *, 'enseignant' as role FROM enseignants WHERE email = ?", [email]);
    if (rows.length > 0) return rows[0];

    // Check etudiants table
    [rows] = await db.query("SELECT *, 'etudiant' as role FROM etudiants WHERE email = ?", [email]);
    if (rows.length > 0) return rows[0];

    return null;
  }

  // Find user by ID and role
  static async findByIdAndRole(id, role) {
    let query = "";
    switch (role) {
      case "admin":
        query = "SELECT *, 'admin' as role FROM admins WHERE id = ?";
        break;
      case "enseignant":
        query = "SELECT *, 'enseignant' as role FROM enseignants WHERE id = ?";
        break;
      case "etudiant":
        query = "SELECT *, 'etudiant' as role FROM etudiants WHERE id = ?";
        break;
      default:
        return null;
    }

    const [rows] = await db.query(query, [id]);
    return rows[0];
  }

  // Create a user based on role
  static async create(user) {
    const { username, email, password, role } = user;
    let query = "";
    let params = [];

    switch (role) {
      case "admin":
        query = "INSERT INTO admins(username, email, password) VALUES (?, ?, ?)";
        params = [username, email, password];
        break;
      case "enseignant":
        query = "INSERT INTO enseignants(username, email, password, module) VALUES (?, ?, ?, ?)";
        params = [username, email, password, "General"];
        break;
      case "etudiant":
        query = "INSERT INTO etudiants(username, email, password, classe_id) VALUES (?, ?, ?, ?)";
        params = [username, email, password, 1]; // Default to class ID 1
        break;
      default:
        throw new Error("Invalid user role");
    }

    await db.query(query, params);
    return true;
  }
}