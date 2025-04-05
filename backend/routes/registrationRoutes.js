import express from "express"
import {
  registerForSemester,
  getMyRegistrations,
  getPendingDepartmentHeadApprovals,
  departmentHeadApproval,
  getPendingDeanApprovals,
  deanApproval,
} from "../controllers/registrationController.js"
import { protect, student, depHead, admin } from "../middleware/authMiddleware.js"

const router = express.Router()

// Student routes
router.route("/").post(protect, student, registerForSemester).get(protect, student, getMyRegistrations)

// Department Head routes
router.route("/department-head-pending").get(protect, depHead, getPendingDepartmentHeadApprovals)

router.route("/:id/department-head-approval").put(protect, depHead, departmentHeadApproval)

// Dean routes
router.route("/dean-pending").get(protect, admin, getPendingDeanApprovals)

router.route("/:id/dean-approval").put(protect, admin, deanApproval)

export default router

