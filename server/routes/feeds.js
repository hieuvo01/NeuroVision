import express from "express";
import OpenAI from "openai";
const route = express.Router();
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import FeedsSchema from "../schemas/feeds.js";
import jwt from "jsonwebtoken";
dotenv.config();

// Configuration
// cloudinary.config({
//   cloud_name: process.env.CLOUD_APP_NAME,
//   api_key: process.env.CLOUD_API_KEY,
//   api_secret: process.env.CLOUD_API_KEY_SECRET, // Click 'View API Keys' above to copy your API secret
// });

// ham tao feed (image)
route.post("/create", async (req, res, next) => {
  try {
    const { token } = req.query;
    const user = jwt.decode(token, process.env.JWT_SECRET);
    if (!user) {
      return res.status(401).json({ message: "Login first" });
    }
    const { title, description, price, type, url } = req.body;
    if (!title || !description || price === null || !type || !url) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // const cloud_url = await cloudinary.uploader.upload(url);
    const feed = await FeedsSchema.create({
      user_id: user.id,
      title,
      description,
      price,
      type,
      text: "",
      image: type === "image" ? url : "",
      video: type === "video" ? url : "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return res.status(200).json({ message: feed });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

//update feed
route.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { token } = req.query;
    const user = jwt.decode(token, process.env.JWT_SECRET);
    if (!user) {
      return res.status(401).json({ message: "Login first" });
    }
    const { title, description, price, type, url } = req.body;
    if (!title || !description || !price || !type) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const feed_id = await FeedsSchema.findById(id);
    if (!feed_id) {
      return res.status(404).json({ message: "Feed not found" });
    }
    if (feed_id.user_id !== user._id) {
      return res.status(403).json({ message: "Forbidden" }); //kiem tra user co quyen xoa feed hay khong
    }
    const feed = await FeedsSchema.findByIdAndUpdate(id, {
      user_id: user.id,
      title,
      description,
      price,
      type,
      text: "",
      image: type === "image" ? url : "",
      video: type === "video" ? url : "",
      updatedAt: new Date(),
    });
    return res.status(200).json({ message: feed });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

//delete feed
route.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { token } = req.query;
    const user = jwt.decode(token, process.env.JWT_SECRET);
    if (!user) {
      return res.status(401).json({ message: "Login first" });
    }
    const feed_id = await FeedsSchema.findById(id);
    if (!feed_id) {
      return res.status(404).json({ message: "Feed not found" });
    }
    if (feed_id.user_id !== user._id) {
      return res.status(403).json({ message: "Forbidden" }); //kiem tra user co quyen xoa feed hay khong
    }
    await FeedsSchema.findByIdAndDelete(id);
    return res.status(200).json({ message: "Feed deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

//search feed
route.get("/search", async (req, res, next) => {
  try {
    const query = {};
    if (req.query.keywords) {
      const keyword = req.query.keywords.split(" ").join(" | ");
      query.$text = { $search: keyword };
    }
    if (req.query.type) {
      query.type = req.query.type;
    }

    const feeds = await FeedsSchema.find(query);
    return res.status(200).json({ feeds });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// route mac dinh
route.get("/", (req, res) => {
  res.send("hello world");
});

export default route;
