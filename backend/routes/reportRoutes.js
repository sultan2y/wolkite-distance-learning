import express from "express"
import { getStudentResultsReport, getGradeReport } from "../controllers/reportController.js"
import { protect, admin, depHead } from "../middleware/authMiddleware.js"

const router = express.Router()

router.route("/student-results").get(protect, depHead, getStudentResultsReport)
router.route("/grade-report").get(protect, admin, getGradeReport)

export default router

