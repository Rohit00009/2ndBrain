"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("./db");
const middleware_1 = require("./middleware");
const app = (0, express_1.default)();
app.use(express_1.default.json());
const userSchema = zod_1.z.object({
    username: zod_1.z.string().min(3),
    password: zod_1.z.string().min(6),
});
app.get("/", (req, res) => {
    res.send("Server is running");
});
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //Todo : zod validation ,hash the passwords
    try {
        const { username, password } = userSchema.parse(req.body);
        const existingUser = yield db_1.UserModel.findOne({ username });
        if (existingUser) {
            return res.status(411).json({ error: "Username already taken" });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const newUser = yield db_1.UserModel.create({
            username: username,
            password: hashedPassword,
        });
        res.status(201).json({ message: "User created", userId: newUser._id });
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: err.issues });
        }
        console.error(err);
        res.status(500).json({ error: "Something went wrong!" });
    }
}));
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.body.username;
    const password = req.body.password;
    const existingUser = yield db_1.UserModel.findOne({ username });
    if (!existingUser) {
        return res.status(403).json({ message: "Incorrect credentials" });
    }
    const isPasswordCorrect = yield bcryptjs_1.default.compare(password, existingUser.password);
    try {
        const existingUser = yield db_1.UserModel.findOne({ username });
        if (!existingUser) {
            return res.status(403).json({ message: "Incorrect credentials" });
        }
        const isPasswordCorrect = yield bcryptjs_1.default.compare(password, existingUser.password);
        if (!isPasswordCorrect) {
            return res.status(403).json({ message: "Incorrect credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ id: existingUser._id }, config_1.JWT_PASSWORD);
        res.json({ token });
    }
    catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}));
app.post("/api/v1/content", middleware_1.userMiddleware, (req, res) => {
    const { link, title } = req.body;
    db_1.ContetModel.create({
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
app.get("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userId = req.userId;
    const content = yield db_1.ContetModel.find({
        userId: userId,
    }).populate("userId", "username");
    res.json({
        content,
    });
}));
app.delete("/api/v1/signup", (req, res) => { });
app.post("/api/v1/brain/share", (req, res) => { });
app.get("/api/v1/brain/:shareLink", (req, res) => { });
app.listen(3000);
