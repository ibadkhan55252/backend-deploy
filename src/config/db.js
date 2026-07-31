import mongoose from "mongoose";


export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected");

        mongoose.connection.on("error", (err) => {
            console.error("MongoDB error:", err);
        });
    } catch (error) {
        console.error("Failed to connect:", error.message);
        process.exit(1);
    }
};