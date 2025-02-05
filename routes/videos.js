import express from "express";
import {uploadVideo, getVideos, handleClick} from "../controllers/Videos.js";
import multer from "multer";
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", uploadVideo);
router.post("/uploadFile", upload.single("file"), handleClick);
router.get("/:clientId", getVideos);

export default router;