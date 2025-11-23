import express from "express";
import upload from "../middlewares/uploadMiddleware.js";
import { uploadImage, getImages } from "../controllers/imagesController.js";

const router = express.Router();

router.post("/", upload.single("image"), uploadImage);
router.get("/", getImages);

export default router;
