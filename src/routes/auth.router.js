import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js"
import { upload } from "../config/multer.config.js";

const authRouter = Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many attempts, please try again later" }
});


authRouter.get("/", authenticate, authController.getAllUsers)
authRouter.post("/login", authLimiter, authController.login)
authRouter.post("/", upload.single("profileImage"), authLimiter, authController.register)

// generate access token
authRouter.post("/refresh", authLimiter, authController.refreshToken)

// verify otp
authRouter.post("/verify-otp", authenticate, authController.verifyOtp)
authRouter.get("/verify-user", authController.verifyEmail)

// forget password
authRouter.post("/forgot-password", authLimiter, authController.forgotPassword)
authRouter.post("/forgot-password/verify-otp", authLimiter, authController.verifyForgotPasswordOtp)
authRouter.post("/reset-password/:token", authLimiter, authController.resetPassword)

// logout
authRouter.post("/logout", authenticate, authController.logout)


export default authRouter