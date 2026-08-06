import mongoose from 'mongoose';
import { COLLECTIONS } from '../constants/index.js';

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: COLLECTIONS.USERS,
        required: true,
    },
    refreshTokenHash: {
        type: String,
        required: true,
    },
    ip: {
        type: String,
        required: true,
    },
    userAgent: {
        type: String,
        required: true,
    },
    revoked: {
        type: Boolean,
        default: false,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
},
    { timestamps: true }
);

const Session = mongoose.model(COLLECTIONS.SESSIONS, sessionSchema);

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default Session;