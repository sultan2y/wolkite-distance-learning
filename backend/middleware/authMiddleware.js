import jwt from "jsonwebtoken"
import asyncHandler from "express-async-handler"
import User from "../models/User.js"
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export default errorHandler; // For ES modules
// module.exports = errorHandler; // For CommonJS


const protect = asyncHandler(async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.id).select("-password")
      next()
    } catch (error) {
      console.error(error)
      res.status(401)
      throw new Error("Not authorized, token failed")
    }
  }

  if (!token) {
    res.status(401)
    throw new Error("Not authorized, no token")
  }
})

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next()
  } else {
    res.status(401)
    throw new Error("Not authorized as an admin")
  }
}

const student = (req, res, next) => {
  if (req.user && req.user.role === "student") {
    // Allow access to payment routes even if payment is not verified
    if (req.originalUrl.includes("/api/payments")) {
      return next()
    }

    // For other student routes, check payment status
    if (req.user.paymentStatus === "verified") {
      next()
    } else {
      res.status(403)
      throw new Error("Access denied. Please complete your payment to access this resource.")
    }
  } else {
    res.status(401)
    throw new Error("Not authorized as a student")
  }
}

const instructor = (req, res, next) => {
  if (req.user && req.user.role === "instructor") {
    next()
  } else {
    res.status(401)
    throw new Error("Not authorized as an instructor")
  }
}

const coordinator = (req, res, next) => {
  if (req.user && req.user.role === "coordinator") {
    next()
  } else {
    res.status(401)
    throw new Error("Not authorized as a coordinator")
  }
}

const depHead = (req, res, next) => {
  if (req.user && (req.user.role === "dep-head" || req.user.role === "CollegeDean")) {
    next()
  } else {
    res.status(401)
    throw new Error("Not authorized as a department head or college dean")
  }
}

export { protect, admin, student, instructor, coordinator, depHead }

