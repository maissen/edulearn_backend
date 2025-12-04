// src/middlewares/upload.js
import multer from "multer";
import path from "path";

// Configuration du stockage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

// Filtre des fichiers
function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (![".png", ".jpg", ".jpeg", ".gif"].includes(ext)) {
    return cb(new Error("Seules les images PNG/JPG/JPEG/GIF sont autorisées"));
  }
  cb(null, true);
}

// Création de l'instance multer
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo
  fileFilter
});

export default upload;