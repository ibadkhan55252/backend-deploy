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
},
    { timestamps: true }
);

const Session = mongoose.model(COLLECTIONS.SESSIONS, sessionSchema);

export default Session;