import express from "express"
import {
  createAttendance,
  getAttendanceSessions,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
  submitAttendance,
  approveAttendance,
  getSubmittedAttendance,
  getApprovedAttendance,
} from "../controllers/attendanceController.js"
import {
  addAttendanceRecord,
  getAttendanceRecords,
  deleteAttendanceRecord,
  bulkUpdateAttendanceRecords,
  getStudentAttendanceStats,
} from "../controllers/attendanceRecordController.js"
import { protect, instructor, depHead } from "../middleware/authMiddleware.js"

const router = express.Router()

// Attendance session routes
router.route("/").post(protect, instructor, createAttendance).get(protect, instructor, getAttendanceSessions)

router.route("/submitted").get(protect, depHead, getSubmittedAttendance)

router.route("/approved").get(protect, depHead, getApprovedAttendance)

router.route("/student/:studentId").get(protect, getStudentAttendanceStats)

router
  .route("/:id")
  .get(protect, getAttendanceById)
  .put(protect, instructor, updateAttendance)
  .delete(protect, instructor, deleteAttendance)

router.route("/:id/submit").put(protect, instructor, submitAttendance)

router.route("/:id/approve").put(protect, depHead, approveAttendance)

// Attendance record routes
router.route("/:id/records").post(protect, instructor, addAttendanceRecord).get(protect, getAttendanceRecords)

router.route("/:id/records/bulk").post(protect, instructor, bulkUpdateAttendanceRecords)

router.route("/:id/records/:recordId").delete(protect, instructor, deleteAttendanceRecord)

export default router

