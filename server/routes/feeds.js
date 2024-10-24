import express from "express";
import OpenAI from "openai";
const route = express.Router();
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import FeedsSchema from "../schemas/feeds.js";
dotenv.config();

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_APP_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_KEY_SECRET, // Click 'View API Keys' above to copy your API secret
});

route.post("/create", async (req, res, next) => {
  try {
    const { token } = req.query;
    const user = jwt.decode(token, process.env.JWT_SECRET);
    if (!user) {
      return res.status(401).json({ message: "Login first" });
    }
    const { title, description, price, type, url } = req.body;
    if (!title || !description || !price || !type || !url) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const cloud_url = await cloudinary.uploader.upload(url);
    const feed = await FeedsSchema.create({
      user_id: user.id,
      title,
      public_id: cloudinary.public_id,
      description,
      price,
      type,
      text: "",
      image: type === "image" ? cloud_url.url : "",
      video: type === "video" ? cloud_url.url : "",
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
    const cloud_url = await cloudinary.uploader.upload(url);
    const feed = await FeedsSchema.findByIdAndUpdate(id, {
      user_id: user.id,
      title,
      description,
      price,
      type,
      text: "",
      image: type === "image" ? cloud_url.url : "",
      video: type === "video" ? cloud_url.url : "",
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
    await cloudinary.uploader.destroy(feed_id.public_id); //xoa anh khi xoa feed
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
    const { keyword } = req.query;
    const feeds = await FeedsSchema.find({
      $text: { $search: keyword },
    });
    return res.status(200).json({ feeds });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// respond with "hello world" when a GET request is made to the homepage
route.get("/", (req, res) => {
  res.send("hello world");
});

export default route;
