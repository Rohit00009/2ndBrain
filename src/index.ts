import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "./config";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { ContetModel, LinkModel, UserModel } from "./db";
import { userMiddleware } from "./middleware";
import { random } from "./util";

const app = express();
app.use(express.json());

const userSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.post("/api/v1/signup", async (req, res) => {
  //Todo : zod validation ,hash the passwords
  try {
    const { username, password } = userSchema.parse(req.body);
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      return res.status(411).json({ error: "Username already taken" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await UserModel.create({
      username: username,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User created", userId: newUser._id });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues });
    }
    console.error(err);
    res.status(500).json({ error: "Something went wrong!" });
  }
});

app.post("/api/v1/signin", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const existingUser = await UserModel.findOne({ username });
  if (!existingUser) {
    return res.status(403).json({ message: "Incorrect credentials" });
  }
  const isPasswordCorrect = await bcrypt.compare(
    password,
    existingUser.password
  );

  try {
    const existingUser = await UserModel.findOne({ username });

    if (!existingUser) {
      return res.status(403).json({ message: "Incorrect credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect) {
      return res.status(403).json({ message: "Incorrect credentials" });
    }

    const token = jwt.sign({ id: existingUser._id }, JWT_PASSWORD);

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/v1/content", userMiddleware, (req, res) => {
  const { link, title } = req.body;
  ContetModel.create({
    title: title,
    link: link,
    //@ts-ignore
    userId: req.userId,
    tags: [],
  });
  return res.json({
    message: "Content Added!",
  });
});

app.get("/api/v1/content", userMiddleware, async (req, res) => {
  //@ts-ignore
  const userId = req.userId;
  const content = await ContetModel.find({
    userId: userId,
  }).populate("userId", "username");
  res.json({
    content,
  });
});

app.delete("/api/v1/signup", userMiddleware, async (req, res) => {
  const contentId = req.body.contentId;
  await ContetModel.deleteMany({
    contentId,
    //@ts-ignore
    userId: req.userId,
  });

  res.json({
    message: "Deleted!",
  });
});

app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
  const share = req.body.share;
  if (share) {
    const existingLink = await LinkModel.findOne({
      //@ts-ignore
      userId: req.userId,
    });

    if (existingLink) {
      res.json({
        hash: existingLink.hash,
      });
      return;
    }
    const hash = random(10);
    await LinkModel.create({
      //@ts-ignore
      userId: req.userId,
      hash: hash,
    });

    res.json({
      message: "/share/" + hash,
    });
  } else {
    await LinkModel.deleteOne({
      //@ts-ignore
      userId: req.userId,
    });
    res.json({
      message: "Removed Link",
    });
  }
});

app.get("/api/v1/brain/:shareLink", async (req, res) => {
  const hash = req.params.shareLink;
  const link = await LinkModel.findOne({
    hash,
  });

  if (!link) {
    res.status(411).json({
      message: "Sorry incorrect input!",
    });
    return; //early return
  }
  //userId
  const content = await ContetModel.find({
    userId: link.userId,
  });

  const user = await UserModel.findOne({
    _id: link.userId,
  });

  if (!user) {
    res.status(411).json({
      message: "User not found!",
    });
    return; //early return
  }

  res.json({
    username: user.username,
    content: content,
  });
});

app.listen(3000);
