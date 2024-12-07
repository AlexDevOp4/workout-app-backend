import express from "express";
import "dotenv/config";
import authRoutes from "./routes/authRoutes.js";
import logger from "./middleware/logger.js";
import errorHandler from "./middleware/errorHandler.js";
import config from "./config.js";
import db from "./db/db.js";
const app = express();

app.use(express.json());
app.use(logger);
const PORT = config.port;


// Example route
app.get("/users", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).send("Internal Server Error");
  }
});

app.use("/auth", authRoutes);

app.use(errorHandler);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
