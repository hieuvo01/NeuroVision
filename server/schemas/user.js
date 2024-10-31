import mongoose, { Schema } from "mongoose";

const User = new Schema({
  name: {
    type: String,
  },
  username: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
    validate: [
      (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      "Invalid email format",
    ],
  },
  avatar: {
    type: String,
    default: "/client/app/static_components/user.png",
  },
  phone_number: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
});

const UserSchema = mongoose.model("User", User);

export default UserSchema;
