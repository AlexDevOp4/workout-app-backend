import express from "express";
import Video from "../models/Video.js"; // Adjust the path if needed

const router = express.Router();

/**
 * @route   POST /api/videos
 * @desc    Create a new video
 */
router.post("/", async (req, res) => {
  try {
    const { userId, title, videoUrl, thumbnailUrl } = req.body;

    if (!userId || !title || !videoUrl || !thumbnailUrl) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newVideo = new Video({ userId, title, videoUrl, thumbnailUrl });
    await newVideo.save();

    res.status(201).json(newVideo);
  } catch (error) {
    console.error("Error creating video:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @route   GET /api/videos
 * @desc    Get all videos
 */
router.get("/", async (req, res) => {
  try {
    const videos = await Video.find().populate("userId", "name email");
    res.status(200).json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @route   GET /api/videos/:id
 * @desc    Get a single video by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate(
      "userId",
      "name email"
    );

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.status(200).json(video);
  } catch (error) {
    console.error("Error fetching video:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @route   PUT /api/videos/:id
 * @desc    Update a video by ID
 */
router.put("/:id", async (req, res) => {
  try {
    const { title, videoUrl, thumbnailUrl } = req.body;

    const updatedVideo = await Video.findByIdAndUpdate(
      req.params.id,
      { title, videoUrl, thumbnailUrl },
      { new: true, runValidators: true }
    );

    if (!updatedVideo) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.status(200).json(updatedVideo);
  } catch (error) {
    console.error("Error updating video:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @route   DELETE /api/videos/:id
 * @desc    Delete a video by ID
 */
router.delete("/:id", async (req, res) => {
  try {
    const deletedVideo = await Video.findByIdAndDelete(req.params.id);

    if (!deletedVideo) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
