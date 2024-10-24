import mongoose, { Schema } from "mongoose";

const Feeds = new Schema({
  user_id: {
    type: String,
  },
  public_id: {
    type: String,
  },
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    min: 0,
  },
  text: {
    type: String,
  },
  image: {
    type: String,
  },
  video: {
    type: String,
  },
  type: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const FeedsSchema = mongoose.model("Feeds", Feeds);

export default FeedsSchema;
