import jwt from "jsonwebtoken"

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "")
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided"
    })
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({
      success: false,
      message: "Token expired or invalid"
    })
  }
}
