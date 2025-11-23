import { db } from "../../config/db.js";

export default class Forum {
  static async findAll() {
    const [rows] = await db.query(
      `SELECT f.id, f.titre, f.contenu, f.user_id, u.username 
       FROM forum f 
       JOIN users u ON u.id = f.user_id
       ORDER BY f.id DESC`
    );
    return rows;
  }

  static async create(post) {
    const { titre, contenu, user_id } = post;
    await db.query(
      "INSERT INTO forum(titre, contenu, user_id) VALUES (?, ?, ?)",
      [titre, contenu, user_id]
    );
  }

  static async addComment(comment) {
    const { contenu, user_id, post_id } = comment;
    await db.query(
      "INSERT INTO comments(contenu, user_id, post_id) VALUES (?, ?, ?)",
      [contenu, user_id, post_id]
    );
  }
}
