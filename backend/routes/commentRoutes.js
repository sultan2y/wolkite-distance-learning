import express from "express"
import { getComments, createComment, deleteComment } from "../controllers/commentController.js"
import { protect, admin } from "../middleware/authMiddleware.js"

const router = express.Router()

router.route("/").get(protect, admin, getComments).post(protect, admin, createComment)

router.route("/:id").delete(protect, admin, deleteComment)

export default router

