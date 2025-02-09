import { ref, getDownloadURL, listAll, uploadBytes } from "firebase/storage";
import path from "path";
import { storage, db } from "../firebase/index.js";
import { doc, setDoc } from "firebase/firestore";
import multer from "multer";
import fs from "fs"; // Needed for file streaming
import ffmpeg from "fluent-ffmpeg";
import { fileURLToPath } from "url";
import Video from "../models/VideoSchema.js";
import { error } from "console";

ffmpeg.setFfmpegPath("/opt/homebrew/bin/ffmpeg"); // Mac/Linux

// Configure multer for file uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Create a new video
export const createVideo = async (userId, title, videoUrl, thumbnailUrl) => {
  try {
    if (!userId || !title || !videoUrl || !thumbnailUrl) {
      return new Error("All fields are required");
    }

    // ✅ Check if the video already exists
    const existingVideo = await Video.findOne({ title });
    if (existingVideo) {
      return new Error("Video already exists");
    }

    const newVideo = new Video({ userId, title, videoUrl, thumbnailUrl });
    await newVideo.save();
    console.log("New video created:", newVideo);
    return newVideo;
  } catch (error) {
    return new Error("Error creating video: " + error.message);
  }
};

export const getVideos = async (req, res) => {
  try {
    const storageRef = ref(storage, `videos/${req.query.userId}`);
    const thumbnailRef = ref(
      storage,
      `thumbnails/${req.query.userId}/${req.query.exerciseId}`
    );

    // Get list of files in the directory
    const filesList = await listAll(storageRef);
    const thumbnailList = await listAll(thumbnailRef);

    // Fetch the URLs for each file
    const videoUrls = await Promise.all(
      filesList.items.map(async (fileRef) => {
        const url = await getDownloadURL(fileRef);
        return { name: fileRef.name, url };
      })
    );

    // Fetch the URLs for each thumbnail
    const thumbnailUrls = await Promise.all(
      thumbnailList.items.map(async (fileRef) => {
        const url = await getDownloadURL(fileRef);
        return { name: fileRef.name, url };
      })
    );
    console.log("Video URLs:", videoUrls);
    console.log("Thumbnail URLs:", thumbnailUrls);

    res.status(200).json({ videos: videoUrls, thumbnails: thumbnailUrls });
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const handleClick = async (req, res) => {
  const { userId, exerciseId } = req.query;
  try {
    // ✅ Ensure multer processes the file
    const file = req.file;
    if (!file) {
      return res.status(400).send({ error: "No file provided" });
    }

    console.log("Uploading video...");
    const videoFileName = `${Date.now()}-${file.originalname}`;
    const videoRef = ref(storage, `videos/${userId}/${videoFileName}`);

    // ✅ Upload video to Firebase Storage
    await uploadBytes(videoRef, file.buffer, {
      contentType: file.mimetype,
    });

    // ✅ Get Video URL
    const videoURL = await getDownloadURL(videoRef);
    console.log("Video uploaded:", videoURL);

    // ✅ Generate a thumbnail from the video
    const thumbnailFileName = `thumbnail-${Date.now()}-${file.originalname}.png`;
    const thumbnailPath = path.join(
      __dirname,
      `../uploads/${thumbnailFileName}`
    );

    console.log("Generating thumbnail...");
    await new Promise((resolve, reject) => {
      ffmpeg(file.path)
        .screenshots({
          timestamps: ["00:00:01"], // Capture a frame at 1s mark
          filename: thumbnailFileName,
          folder: path.join(__dirname, "../uploads"),
          size: "320x240",
        })
        .on("end", resolve)
        .on("error", reject);
    });

    console.log("Thumbnail generated:", thumbnailPath);

    // ✅ Upload Thumbnail to Firebase Storage
    const thumbFileBuffer = fs.readFileSync(thumbnailPath);
    const thumbnailRef = ref(
      storage,
      `thumbnails/${userId}/${exerciseId}/${thumbnailFileName}`
    );
    await uploadBytes(thumbnailRef, thumbFileBuffer, {
      contentType: "image/png",
    });

    // ✅ Get Thumbnail URL
    const thumbnailURL = await getDownloadURL(thumbnailRef);
    console.log("Thumbnail uploaded:", thumbnailURL);

    // ✅ Store Video & Thumbnail URLs in the Database
    const uploadedToDatabase = await uploadToDatabase(
      userId,
      file.originalname,
      videoURL,
      thumbnailURL
    );

    if (uploadedToDatabase instanceof Error) {
      return res.status(500).send({ error: "Failed to save metadata" });
    }
    console.log("Video and thumbnail URLs saved to database");

    // ✅ Cleanup: Remove the local thumbnail file
    fs.unlinkSync(thumbnailPath);

    return res.status(200).send({
      message: "File and thumbnail uploaded successfully",
      videoURL,
      thumbnailURL,
    });
  } catch (error) {
    console.error("Error in handleClick:", error);
    res.status(500).send({ error: "Internal server error" });
  }
};

// Helper function to store metadata in your database
const uploadToDatabase = async (userId, title, vidoeUrl, thumnailUrl) => {
  console.log("Saving file metadata to database...");
  const createdVideo = await createVideo(userId, title, vidoeUrl, thumnailUrl);

  if (createdVideo instanceof Error) {
    console.error("Error creating video:", createdVideo.message);
  }
  console.log("Video metadata saved:", createdVideo);
  return createdVideo;
};

// Upload Video Metadata
export const uploadVideo = async (req, res) => {
  try {
    let docData = {
      mostRecentUploadURL: req.body.url,
      username: "jasondubon",
    };
    const userRef = doc(db, "users", docData.username);

    setDoc(userRef, docData, { merge: true })
      .then(() => {
        console.log("successfully updated DB");
      })
      .catch((error) => {
        console.log("errrror");
      });
    // const { clientId, videoUrl, title, description } = req.body;
    // const videoData = {
    //   clientId,
    //   videoUrl,
    //   title,
    //   description,
    //   uploadedAt: new Date(),
    // };
    // await db.collection("videos").add(videoData);
    console.log(userRef, "userRef");

    res.status(200).send({ message: "Video metadata stored successfully!" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// ✅ Get all videos
export const getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find().populate(
      "userId",
      "firstName lastName email"
    );
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get a single video by ID
export const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate(
      "userId",
      "firstName lastName email"
    );
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    res.status(200).json(video);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get vidoes by User ID
export const getVideosByUserId = async (req, res) => {
  try {
    const videos = await Video.find({ userId: req.params.userId });
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Update a video
export const updateVideo = async (req, res) => {
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
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Delete a video
export const deleteVideo = async (req, res) => {
  try {
    const deletedVideo = await Video.findByIdAndDelete(req.params.id);
    if (!deletedVideo) {
      return res.status(404).json({ message: "Video not found" });
    }
    res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
