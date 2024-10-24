import express from "express";
import connectDB from "./db/connectDB.js";
import cors from "cors";
import * as dotenv from "dotenv";
import userRoutes from "./routes/user.js";
import feedRoutes from "./routes/feeds.js";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/feeds", feedRoutes);
app.use('/', (req, res, next) => {
  res.status(404).json({ message: "Page not found" });
  next();
})

// Connect to MongoDB
const startServer = async () => {
  try {
    connectDB(process.env.MONGODB_URL);
    app.listen(process.env.HTTP_PORT, () => {
      console.log(`Server running on port ${process.env.HTTP_PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();
