import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js"
import { upload } from "../config/multer.config.js";

const authRouter = Router();


authRouter.get("/", authenticate, authController.getAllUsers)
authRouter.post("/login", authController.login)
authRouter.post("/", upload.single("profileImage"), authController.register)

// generate access token
authRouter.post("/refresh", authController.refreshToken)

// verify otp
authRouter.post("/verify-otp", authenticate, authController.verifyOtp)

// forget password
authRouter.post("/forgot-password", authController.forgotPassword)
authRouter.post("/forgot-password/verify-otp", authController.verifyForgotPasswordOtp)
authRouter.post("/reset-password/:token", authController.resetPassword)


export default authRouter