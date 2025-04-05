import express from "express"
import {
  getAdminStats,
  getStudents,
  updateStudentStatus,
  viewComments,
  deleteComment,
} from "../controllers/adminController.js"
import { protect, admin } from "../middleware/authMiddleware.js"

const router = express.Router()

router.route("/stats").get(protect, admin, getAdminStats)
router.route("/students").get(protect, admin, getStudents)
router.route("/students/:id/status").put(protect, admin, updateStudentStatus)
router.route("/comments").get(protect, admin, viewComments)
router.route("/comments/:id").delete(protect, admin, deleteComment)

export default router

