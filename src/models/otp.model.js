import mongoose from 'mongoose';
import { COLLECTIONS } from '../constants/index.js';

const otpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: COLLECTIONS.USERS,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
},
    { timestamps: true }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 10 * 60 }); // Index to automatically delete expired OTPs after 10 minutes

const OTP = mongoose.model(COLLECTIONS.OTPS, otpSchema);

export default OTP;