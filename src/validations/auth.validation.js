import * as yup from "yup"

export const authSchema = yup.object({
    name: yup
        .string()
        .trim()
        .required("Name can not be empty")
        .min(2, "Name must be at least 2 character long")
        .max(50, "Name can not be exceed 50 characters"),

    email: yup.string()
        .email()
        .trim()
        .required("Email can not be empty"),

    password: yup.string()
        .required()
        .min(6, "Password must be at least 6 characters")
        .max(128, "Password must be at most 128 characters"),

    profileImage: yup.string()
        .required("Profile image is required")
})


export const registerValidation = authSchema.clone();


export const loginValidation = authSchema.clone().omit(["name", "profileImage"])

