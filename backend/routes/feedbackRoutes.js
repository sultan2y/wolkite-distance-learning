import express from "express"
import { getAllFeedback, createFeedback, deleteFeedback } from "../controllers/feedbackController.js"
import { protect, admin } from "../middleware/authMiddleware.js"

const router = express.Router()

router.route("/").get(protect, admin, getAllFeedback).post(createFeedback)

router.route("/:id").delete(protect, admin, deleteFeedback)

export default router

