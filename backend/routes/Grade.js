import express from "express"
import { submitGrade, approveGrade } from "../controllers/gradeController.js"
import { protect, admin, instructor } from "../middleware/authMiddleware.js"

const router = express.Router()

router.route("/").post(protect, instructor, submitGrade)
router.route("/:id/approve").put(protect, admin, approveGrade)

export default router

