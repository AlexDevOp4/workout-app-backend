import express from "express";
import { uploadVideo, getVideos, handleClick, getVideoById, getVideosByUserId } from "../controllers/Videos.js";
import multer from "multer";
const router = express.Router();
import fs from "fs";

import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the uploads directory exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // ✅ Create the directory if it doesn't exist
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "../uploads"); // Ensure correct path
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true }); // ✅ Create directory if missing
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post("/upload", uploadVideo);
router.post("/uploadFile", upload.single("file"), handleClick);
router.get("/", getVideos);
router.get("/:userId", getVideosByUserId);

export default router;
