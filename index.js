import express from "express";
import "dotenv/config";
import authRoutes from "./routes/authRoutes.js";
import logger from "./middleware/logger.js";
import errorHandler from "./middleware/errorHandler.js";
import config from "./config.js";

const app = express();

app.use(express.json());
app.use(logger);
app.use("/auth", authRoutes);

app.use(errorHandler);

const PORT = config.port;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
