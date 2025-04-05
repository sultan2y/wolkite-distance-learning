import express from "express"
import { getAssignedInstructors } from "../controllers/instructorController.js"
import { protect } from "../middleware/authMiddleware.js"

const router = express.Router()

router.route("/assigned").get(protect, getAssignedInstructors)

export default router

