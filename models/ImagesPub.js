import { db } from "../../config/db.js";

export default class ImagesPub {
  static async addImage(url) {
    await db.query("INSERT INTO images(url) VALUES(?)", [url]);
  }

  static async getAll() {
    const [rows] = await db.query("SELECT * FROM images ORDER BY id DESC");
    return rows;
  }
}
