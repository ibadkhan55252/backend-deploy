import "dotenv/config"
import express from "express"
import { Router } from "express";
import mainRouter from "./src/routes/main.router.js";
import { connectDB } from "./src/config/db.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/api", mainRouter)


connectDB();

app.listen(process.env.PORT, () => {
    console.log("server is running on port", process.env.PORT)
})


