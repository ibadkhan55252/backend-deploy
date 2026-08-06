import bcrypt from "bcryptjs";

export const decodeHashPassword = async (password, hashedPassword) => {
    try {
        const decodePassword = await bcrypt.compare(password, hashedPassword);
        return decodePassword;
    } catch (error) {
        throw new Error("Failed to hash password");
    }
};
