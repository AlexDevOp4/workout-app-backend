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

const app = express();
const {MONGO_DB, MONGO_USER, MONGO_PASSWORD} = process.env;
const uri = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@trainer-dashboard-clust.uo9tk.mongodb.net/${MONGO_DB}?retryWrites=true&w=majority&appName=trainer-dashboard-cluster`;
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

app.use(cors());

app.use(express.json());
app.use(logger);
const PORT = config.port;

app.use("/auth", authRoutes);
app.use("/users", UserRoutes );
app.use("/exercises", ExerciseRoutes);
app.use("/workouts", WorkoutRoutes);
app.use("/workoutlogs", WorkoutLogRoutes);

app.use(errorHandler);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
