//create user models and schemas
import mongoose, { model, Schema } from "mongoose";
import { string } from "zod";

mongoose
  .connect(
    "mongodb+srv://admin:5hURWwyBDvxuTikf@cluster0.cm424xg.mongodb.net/2ndBrain"
  )
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
