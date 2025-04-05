import express from "express"
import { getActiveUsers, getDeactivatedUsers, toggleUserStatus } from "../controllers/userController.js"
import { protect, admin } from "../middleware/authMiddleware.js"

const router = express.Router()

router.route("/active").get(protect, admin, getActiveUsers)
router.route("/deactivated").get(protect, admin, getDeactivatedUsers)
router.route("/:id/toggle-status").put(protect, admin, toggleUserStatus)

export default router

