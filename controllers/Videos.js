import { getFirestore } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage, db } from "../firebase/index.js";
import { doc, setDoc } from "firebase/firestore";
import multer from "multer";

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

export const handleClick = async (req, res) => {
  try {
    // Ensure multer processes the file
    const file = req.file; // Use req.file for single-file upload
    if (!file) {
      return res.status(400).send({ error: "No file provided" });
    }

    // Create a reference in Firebase Storage
    const fileRef = ref(storage, `videos/${file.originalname}`);

    // Upload the file using uploadBytesResumable
    const uploadTask = uploadBytesResumable(fileRef, file.buffer, {
      contentType: file.mimetype,
    });

    // Monitor progress
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload progress: ${progress}%`);
      },
      (error) => {
        console.error("Upload failed:", error);
        return res.status(500).send({ error: "File upload failed" });
      },
      async () => {
        // Upload completed successfully
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        console.log("File uploaded successfully:", downloadURL);

        // Call your function to store metadata in the database
        await uploadToDatabase(downloadURL, file.originalname);

        return res.status(200).send({
          message: "File uploaded successfully",
          downloadURL,
        });
      }
    );
  } catch (error) {
    console.error("Error in handleClick:", error);
    res.status(500).send({ error: "Internal server error" });
  }
};

// Helper function to store metadata in your database
const uploadToDatabase = async (downloadURL, fileName) => {
  // Replace with your database logic
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

export const getVideos = async (req, res) => {
  try {
    const { clientId } = req.params;
    const snapshot = await db
      .collection("videos")
      .where("clientId", "==", clientId)
      .get();

    const videos = snapshot.docs.map((doc) => doc.data());
    res.status(200).send(videos);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};
