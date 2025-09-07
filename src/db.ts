//create user models and schemas
import mongoose, { model, Schema } from "mongoose";
import dotenv from "dotenv"; 


dotenv.config(); // <-- This must run BEFORE using process.env

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error("MONGO_URI is not defined in .env");
}
mongoose
  .connect(uri)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));
const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const ContenSchema = new Schema({
  title: String,
  link: String,
  tags: [{ type: mongoose.Types.ObjectId, ref: "Tag" }],
  type: String,
  userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
});

const LinkSchema = new Schema({
  hash: String,
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
});

export const UserModel = mongoose.model("User", UserSchema);
export const LinkModel = mongoose.model("Links", LinkSchema);
export const ContetModel = mongoose.model("Content", ContenSchema);
