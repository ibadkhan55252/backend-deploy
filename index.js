import "dotenv/config"
import express from "express"
import { Router } from "express";
import mainRouter from "./src/routes/main.router.js";
import { connectDB } from "./src/config/db.js";
import cookieParser from "cookie-parser";
import multer from "multer";
import cors from "cors";
import helmet from "helmet";

const app = express();
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use("/api", mainRouter)
app.use(multer().none())
app.use('/uploads', express.static('uploads'));


connectDB();

app.listen(process.env.PORT, () => {
    console.log("server is running on port", process.env.PORT)
})


