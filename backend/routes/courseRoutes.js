import express from "express"
import { getCourses, createCourse } from "../controllers/courseController.js"
import { protect, admin } from "../middleware/authMiddleware.js"

const router = express.Router()

router.route("/").get(protect, getCourses).post(protect, admin, createCourse)

export default router

