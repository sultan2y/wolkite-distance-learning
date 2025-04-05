import express from "express"
import { getStudentResults } from "../controllers/resultController.js"
import { protect } from "../middleware/authMiddleware.js"

const router = express.Router()

router.route("/grades").get(protect, getStudentResults)

export default router

