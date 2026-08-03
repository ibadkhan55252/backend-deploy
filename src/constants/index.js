export const baseURL = process.env.BASE_URL

export const COLLECTIONS = Object.freeze({
    USERS: "User",
    OTPS: "OTP",
    SESSIONS: "Session",
})

export const time = {
    SECOND: 1,
    MINUTE: 60, // 60 seconds
    HOUR: 60 * 60, // 3600 seconds
    DAY: 24 * 60 * 60, // 86400 seconds
    WEEK: 7 * 24 * 60 * 60, // 604800 seconds
    MONTH: 30 * 24 * 60 * 60, // Approximate: 2592000 seconds
    YEAR: 365 * 24 * 60 * 60, // Approximate: 31536000 seconds
};

export const fileSize = {
    BYTE: 1,
    KB: 1024,
    MB: 1024 ** 2, // 1,048,576 bytes
    GB: 1024 ** 3, // 1,073,741,824 bytes
    TB: 1024 ** 4, // 1,099,511,627,776 bytes
    PB: 1024 ** 5, // 1,125,899,906,842,624 bytes
};



export const enums = Object.freeze({
    user_roles: Object.freeze({
        GUEST: "GUEST",
        USER: "USER",
        ADMIN: "ADMIN",
    }),
})