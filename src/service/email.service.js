import { transporter } from "../config/mailer.config.js";

export const sendEmail = async (to, subject, text) => {
    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject,
        text
    })
};