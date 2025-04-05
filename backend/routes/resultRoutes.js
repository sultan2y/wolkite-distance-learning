import express from "express"
import { getPendingResults, createResult, approveResult } from "../controllers/resultController.js"
import { protect, admin, instructor } from "../middleware/authMiddleware.js"

const router = express.Router()

router.route("/").post(protect, instructor, createResult)

router.route("/pending").get(protect, admin, getPendingResults)

router.route("/:id/approve").put(protect, admin, approveResult)

export default router

