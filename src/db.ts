//create user models and schemas
import mongoose, { model, Schema } from "mongoose";

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

export const UserModel = mongoose.model("User", UserSchema);
export const ContetModel = mongoose.model("Content", ContenSchema);
