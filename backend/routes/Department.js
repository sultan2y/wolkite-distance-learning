import express from "express"
import { getDepartments, createDepartment } from "../controllers/departmentController.js"
import { protect, admin } from "../middleware/authMiddleware.js"

const router = express.Router()

router.route("/").get(protect, getDepartments).post(protect, admin, createDepartment)

export default router

