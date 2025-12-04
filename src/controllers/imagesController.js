import { db } from "../../config/db.js";

export const uploadImage = async (req, res) => {
  const filePath = "uploads/" + req.file.filename;

  await db.query("INSERT INTO images(url) VALUES(?)", [filePath]);

  res.json({ message: "Image uploadée", url: filePath });
};

export const getImages = async (req, res) => {
  const [rows] = await db.query("SELECT id, url FROM images ORDER BY id DESC");
  res.json(rows);
};