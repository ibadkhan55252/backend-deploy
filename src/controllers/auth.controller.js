import { decodeHashPassword, generateHashPassword } from "../helper/index.js";
import { User } from "../models/user.modal.js";
import OTP from "../models/otp.model.js";
import { loginValidation, registerValidation } from "../validations/auth.validation.js";
import cookies from "cookie-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { generateOtp } from "../utils/index.js";
import crypto from "crypto";
import { sendEmailResend } from "../config/resend.config.js";

export const getMe = (req, res) => {
    return res.status(200).json({
        success: true,
        message: "test request"
    })
}

export const getAllUsers = async (req, res) => {

    try {
        const data = await User.find({ isVerified: true }).select("-password");
        return res.status(200).json({
            success: true,
            message: "fetch all users",
            data: data
        })

    } catch (error) {
        console.error(error.message)
        return res.status(400).json({
            success: false,
            message: error.message || "Something went wrong on get users"
        })
    }

}

export const register = async (req, res) => {

    const body = req.body;

    try {
        const validatedData = await registerValidation.validate(
            body,
            { abortEarly: false, stripUnknown: true }
        )

        const isExistingUser = await User.findOne({ email: validatedData.email })

        if (isExistingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exist"
            })
        }

        const user = new User(validatedData);
        await user.save();

        // generate otp
        const oneTimePassword = generateOtp();

        await OTP.create({
            userId: user._id,
            otp: crypto.createHash("sha256").update(oneTimePassword).digest("hex"),
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // OTP expires in 10 minutes
        })

        const accessToken = jwt.sign({
            id: user._id
        },
            process.env.JWT_SECRET, {
            expiresIn: "15m"
        })

        const refreshToken = jwt.sign({
            id: user._id
        },
            process.env.JWT_SECRET, {
            expiresIn: "7d"
        })

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        const { password, ...safeUser } = user.toObject();

        await sendEmailResend(user.email, "Welcome to our app", `Your OTP is: ${oneTimePassword}`).catch(console.error);

        return res.status(201).json({
            success: true,
            message: "Create user successfully, we have sent u email",
            data: safeUser,
            accessToken
        })

    } catch (error) {

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: error.errors
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || "Something went wrong on auth"
        });
    }

}

export const login = async (req, res) => {

    const body = req.body;

    try {

        const validatedData = await loginValidation.validate(body, { abortEarly: false })

        const isRegisteredUser = await User.findOne({ email: validatedData.email })

        if (!isRegisteredUser) {
            return res.status(400).json({
                success: false,
                message: "User is not registered"
            })
        }

        if (!isRegisteredUser.isVerified) {
            return res.status(400).json({
                success: false,
                message: "You are not verified"
            })
        }

        const decodePassword = await decodeHashPassword(body.password, isRegisteredUser.password)

        if (!decodePassword) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            })
        }


        const { password, ...useData } = isRegisteredUser.toObject();

        return res.status(200).json({
            success: true,
            message: "Login user successfully",
            data: useData
        });


    } catch (error) {

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: "validation failed",
                error: error.errors
            })
        }

        return res.status(500).json({
            success: false,
            message: error.message || "Something went wrong in login"
        })

    }


}

export const refreshToken = async (req, res) => {

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({
            success: false,
            message: "Refresh token not found"
        })
    }

    const decode = jwt.verify(refreshToken, process.env.JWT_SECRET);

    if (!decode) {
        return res.status(401).json({
            success: false,
            message: "Invalid refresh token"
        })
    }

    const accessToken = jwt.sign(
        { id: decode.id },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    )

    return res.status(200).json({
        success: true,
        message: "Post token request",
        accessToken
    })

}

export const verifyOtp = async (req, res) => {

    const { otp } = req.body;

    if (!otp) {
        return res.status(400).json({ success: false, message: "OTP is required" });
    }

    try {

        const otpRecord = await OTP.findOne({ userId: req.user.id });

        if (!otpRecord) {
            return res.status(404).json({
                success: false,
                message: "OTP not found"
            })
        }

        if (otpRecord.expiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired"
            })
        }

        const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

        if (otpRecord.otp !== otpHash) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            })
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        user.isVerified = true;

        await user.save();

        await OTP.deleteOne({ _id: otpRecord._id });

        const { password, ...safeUser } = user.toObject();

        return res.status(200).json({
            success: true,
            message: "Verify otp request",
            data: safeUser
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Something went wrong in verify OTP"
        })
    }
}


export const forgotPassword = async (req, res) => {

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Email is required"
        })
    }

    try {

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const oneTimePassword = generateOtp();

        const cryptoOtp = crypto.createHash("sha256").update(oneTimePassword).digest("hex");

        await OTP.deleteMany({ userId: user._id });

        const otp = new OTP({
            userId: user._id,
            otp: cryptoOtp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // OTP expires in 10 minutes
        });

        await otp.save();

        sendEmail(user.email, "Forgot Password", `Your OTP is: ${oneTimePassword}`).catch(console.error);

        return res.status(200).json({
            success: true,
            message: "Forgot password request",
            data: {
                email: user.email
            }
        })

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message || "Something went wrong in forgot password"
        })

    }

}


export const verifyForgotPasswordOtp = async (req, res) => {

    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({
            success: false,
            message: "Email and OTP are required"
        })
    }
    try {


        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const otpRecord = await OTP.findOne({ userId: user._id, otp: crypto.createHash("sha256").update(otp).digest("hex") });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            })
        }

        if (otpRecord.expiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired"
            })
        }

        const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "10m" })

        await OTP.deleteOne({ _id: otpRecord._id });

        sendEmail(user.email, "reset-password link", `http://localhost:4000/api/auth/reset-password/${resetToken}`).catch(console.error);

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully",
            data: { resetToken }
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "internal server error in verify forgot password otp"
        })
    }

}

export const resetPassword = async (req, res) => {

    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({
            success: false,
            message: "Reset token and new password are required"
        });
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.password = newPassword;

        await user.save();


        return res.status(200).json({
            success: true,
            message: "Password reset successfully"
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Invalid or expired reset token"
        });
    }

}