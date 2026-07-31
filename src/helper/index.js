import bcrypt from "bcryptjs";

export const generateHashPassword = async (password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        return hashedPassword;
    } catch (error) {
        throw new Error("Failed to hash password");
    }
};


export const decodeHashPassword = async (password, hashedPassword) => {
    try {
        const decodePassword = await bcrypt.compare(password, hashedPassword);
        return decodePassword;
    } catch (error) {
        throw new Error("Failed to hash password");
    }
};