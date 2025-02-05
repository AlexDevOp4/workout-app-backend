import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";
import authRoutes from "./routes/authRoutes.js";
import logger from "./middleware/logger.js";
import errorHandler from "./middleware/errorHandler.js";
import config from "./config.js";
import UserRoutes from "./routes/user.js";
import ExerciseRoutes from "./routes/exercise.js";
import WorkoutRoutes from "./routes/workout.js";
import WorkoutLogRoutes from "./routes/workoutLog.js";
import VideoRoutes from "./routes/videos.js";
import multer from "multer";

const app = express();
const { MONGO_DB, MONGO_USER, MONGO_PASSWORD } = process.env;
const uri = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@trainer-dashboard-clust.uo9tk.mongodb.net/${MONGO_DB}?retryWrites=true&w=majority&appName=trainer-dashboard-cluster`;
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
    tls: true,
    socketTimeoutMS: 30000,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

const corsOptions = {
  origin: "http://localhost:5173", // Replace with your frontend origin
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(logger);
const PORT = config.port;

app.use("/auth", authRoutes);
app.use("/users", UserRoutes);
app.use("/exercises", ExerciseRoutes);
app.use("/workouts", WorkoutRoutes);
app.use("/workoutlogs", WorkoutLogRoutes);
app.use('/videos', VideoRoutes);

app.use(errorHandler);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
