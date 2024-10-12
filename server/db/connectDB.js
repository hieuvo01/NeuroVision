import mongoose from "mongoose";
export default function connectDB(url) {
  mongoose.set("strictQuery", true);
  mongoose
    .connect(url)
    .then(() => {
      console.log("Connected to DB successfully!");
    })
    .catch((err) => {
      console.log(err);
    });
}
