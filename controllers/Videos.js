import {
  ref,
  getDownloadURL,
  listAll,
  uploadBytes,
} from "firebase/storage";
import path from "path";
import { storage, db } from "../firebase/index.js";
import { doc, setDoc } from "firebase/firestore";
import multer from "multer";
import fs from "fs"; // Needed for file streaming
import ffmpeg from "fluent-ffmpeg";
import { fileURLToPath } from "url";

ffmpeg.setFfmpegPath("/opt/homebrew/bin/ffmpeg"); // Mac/Linux

// Configure multer for file uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getVideos = async (req, res) => {
  try {
    const storageRef = ref(storage, `videos/${req.query.userId}`);

    // Get list of files in the directory
    const filesList = await listAll(storageRef);

    // Fetch the URLs for each file
    const videoUrls = await Promise.all(
      filesList.items.map(async (fileRef) => {
        const url = await getDownloadURL(fileRef);
        return { name: fileRef.name, url };
      })
    );

    res.status(200).json({ videos: videoUrls });
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
    const videoRef = ref(
      storage,
      `videos/${userId}/${exerciseId}/${videoFileName}`
    );

    // ✅ Upload video to Firebase Storage
    await uploadBytes(videoRef, file.buffer, {
      contentType: file.mimetype,
    });

    // ✅ Get Video URL
    const videoURL = await getDownloadURL(videoRef);
    console.log("Video uploaded:", videoURL);

    // ✅ Generate a thumbnail from the video
    const thumbnailFileName = `thumbnail-${Date.now()}.png`;
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
    await uploadToDatabase(videoURL, thumbnailURL, file.originalname);

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
const uploadToDatabase = async (downloadURL, fileName) => {
  console.log("Saving file metadata to database...");
  console.log({ downloadURL, fileName });
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

// export const getVideos = async (req, res) => {
//   try {
//     const { clientId } = req.params;
//     const snapshot = await db
//       .collection("videos")
//       .where("clientId", "==", clientId)
//       .get();

//     const videos = snapshot.docs.map((doc) => doc.data());
//     res.status(200).send(videos);
//   } catch (error) {
//     res.status(500).send({ error: error.message });
//   }
// };
