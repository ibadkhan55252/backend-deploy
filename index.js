import "dotenv/config"
import express from "express"
import mainRouter from "./src/routes/main.router.js";
import { connectDB } from "./src/config/db.js";
import cookieParser from "cookie-parser";
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
app.use('/uploads', express.static('uploads'));

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

// Centralized error handler
app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error"
    });
});

const start = async () => {
    try {
        await connectDB();
        app.listen(process.env.PORT, () => {
            console.log("server is running on port", process.env.PORT)
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

start();
