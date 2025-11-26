import { db } from "../../config/db.js";

export default class Forum {
  static async findAll() {
    const [rows] = await db.query(
      `SELECT 
        f.id, 
        f.titre, 
        f.contenu, 
        f.user_id, 
        CASE 
          WHEN f.user_role = 'admin' THEN a.username
          WHEN f.user_role = 'enseignant' THEN e.username
          WHEN f.user_role = 'etudiant' THEN s.username
        END as username
      FROM forum f
      LEFT JOIN admins a ON (f.user_id = a.id AND f.user_role = 'admin')
      LEFT JOIN enseignants e ON (f.user_id = e.id AND f.user_role = 'enseignant')
      LEFT JOIN etudiants s ON (f.user_id = s.id AND f.user_role = 'etudiant')
      ORDER BY f.id DESC`
    );
    return rows;
  }

  static async create(post) {
    const { titre, contenu, user_id, user_role } = post;
    await db.query(
      "INSERT INTO forum(titre, contenu, user_id, user_role) VALUES (?, ?, ?, ?)",
      [titre, contenu, user_id, user_role]
    );
  }

  static async addComment(comment) {
    const { contenu, user_id, user_role, post_id } = comment;
    await db.query(
      "INSERT INTO comments(contenu, user_id, user_role, post_id) VALUES (?, ?, ?, ?)",
      [contenu, user_id, user_role, post_id]
    );
  }
}