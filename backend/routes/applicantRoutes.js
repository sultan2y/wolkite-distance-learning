import express from "express"
import {
  getApplicants,
  getApplicantById,
  approveApplicant,
  rejectApplicant,
} from "../controllers/applicantController.js"
import { protect, admin } from "../middleware/authMiddleware.js"

const router = express.Router()

router.route("/").get(protect, admin, getApplicants)
router.route("/:id").get(protect, admin, getApplicantById)
router.route("/:id/approve").put(protect, admin, approveApplicant)
router.route("/:id/reject").put(protect, admin, rejectApplicant)

export default router

