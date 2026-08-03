import mongoose from "mongoose";
import { COLLECTIONS } from "../constants/index.js";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        otp: {
            type: String,
            required: false,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        profileImage: {
            type: String,
            required: false,
        },
    },
    { timestamps: true }
);


userSchema.pre("save", async function () {

    const user = this;
    if (!user.isModified("password")) return;
    try {
        const hash = await bcrypt.hash(user.password, 10);
        user.password = hash;
    } catch (error) {
        throw error;
    }

});


export const User = mongoose.model(COLLECTIONS.USERS, userSchema);