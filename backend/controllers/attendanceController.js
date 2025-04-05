import asyncHandler from "express-async-handler"
import Attendance from "../models/Attendance.js"
import AttendanceRecord from "../models/AttendanceRecord.js"

// @desc    Create a new attendance session
// @route   POST /api/attendance
// @access  Private/Instructor
const createAttendance = asyncHandler(async (req, res) => {
  const { course, department, semester, year, date, notes } = req.body

  // Validate input
  if (!course || !department || !semester || !year) {
    res.status(400)
    throw new Error("Please fill all required fields")
  }

  // Create attendance session
  const attendance = await Attendance.create({
    course,
    department,
    semester,
    year,
    date: date ? new Date(date) : new Date(),
    instructor: req.user._id,
    notes,
  })

  res.status(201).json({
    message: "Attendance session created successfully",
    attendance,
  })
})

// @desc    Get all attendance sessions for an instructor
// @route   GET /api/attendance
// @access  Private/Instructor
const getAttendanceSessions = asyncHandler(async (req, res) => {
  const { course, department, semester, year, status } = req.query

  // Build filter object
  const filter = { instructor: req.user._id }
  if (course) filter.course = course
  if (department) filter.department = department
  if (semester) filter.semester = semester
  if (year) filter.year = year
  if (status) filter.status = status

  const attendanceSessions = await Attendance.find(filter).sort({ date: -1, createdAt: -1 })

  res.json(attendanceSessions)
})

// @desc    Get attendance session by ID
// @route   GET /api/attendance/:id
// @access  Private
const getAttendanceById = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findById(req.params.id)

  if (!attendance) {
    res.status(404)
    throw new Error("Attendance session not found")
  }

  // Check if user is authorized to view this attendance
  if (
    attendance.instructor.toString() !== req.user._id.toString() &&
    req.user.role !== "admin" &&
    req.user.role !== "dep-head"
  ) {
    res.status(401)
    throw new Error("Not authorized to view this attendance")
  }

  res.json(attendance)
})

// @desc    Update attendance session
// @route   PUT /api/attendance/:id
// @access  Private/Instructor
const updateAttendance = asyncHandler(async (req, res) => {
  const { course, department, semester, year, date, notes } = req.body

  const attendance = await Attendance.findById(req.params.id)

  if (!attendance) {
    res.status(404)
    throw new Error("Attendance session not found")
  }

  // Check if user is the instructor who created this attendance
  if (attendance.instructor.toString() !== req.user._id.toString()) {
    res.status(401)
    throw new Error("Not authorized to update this attendance")
  }

  // Check if attendance is already submitted
  if (attendance.status !== "draft") {
    res.status(400)
    throw new Error("Cannot update attendance that has been submitted")
  }

  // Update attendance
  attendance.course = course || attendance.course
  attendance.department = department || attendance.department
  attendance.semester = semester || attendance.semester
  attendance.year = year || attendance.year
  attendance.date = date ? new Date(date) : attendance.date
  attendance.notes = notes !== undefined ? notes : attendance.notes

  const updatedAttendance = await attendance.save()

  res.json({
    message: "Attendance updated successfully",
    attendance: updatedAttendance,
  })
})

// @desc    Delete attendance session
// @route   DELETE /api/attendance/:id
// @access  Private/Instructor
const deleteAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findById(req.params.id)

  if (!attendance) {
    res.status(404)
    throw new Error("Attendance session not found")
  }

  // Check if user is the instructor who created this attendance
  if (attendance.instructor.toString() !== req.user._id.toString()) {
    res.status(401)
    throw new Error("Not authorized to delete this attendance")
  }

  // Check if attendance is already submitted
  if (attendance.status !== "draft") {
    res.status(400)
    throw new Error("Cannot delete attendance that has been submitted")
  }

  // Delete all attendance records for this session
  await AttendanceRecord.deleteMany({ attendance: attendance._id })

  // Delete attendance session
  await attendance.deleteOne()

  res.json({ message: "Attendance deleted successfully" })
})

// @desc    Submit attendance to department head
// @route   PUT /api/attendance/:id/submit
// @access  Private/Instructor
const submitAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findById(req.params.id)

  if (!attendance) {
    res.status(404)
    throw new Error("Attendance session not found")
  }

  // Check if user is the instructor who created this attendance
  if (attendance.instructor.toString() !== req.user._id.toString()) {
    res.status(401)
    throw new Error("Not authorized to submit this attendance")
  }

  // Check if attendance is already submitted
  if (attendance.status !== "draft") {
    res.status(400)
    throw new Error("Attendance has already been submitted")
  }

  // Check if there are any attendance records
  const recordCount = await AttendanceRecord.countDocuments({ attendance: attendance._id })
  if (recordCount === 0) {
    res.status(400)
    throw new Error("Cannot submit attendance with no records")
  }

  // Update attendance status
  attendance.status = "submitted"
  attendance.submittedAt = new Date()

  const updatedAttendance = await attendance.save()

  res.json({
    message: "Attendance submitted successfully",
    attendance: updatedAttendance,
  })
})

// @desc    Approve attendance (for department head)
// @route   PUT /api/attendance/:id/approve
// @access  Private/DepHead
const approveAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findById(req.params.id)

  if (!attendance) {
    res.status(404)
    throw new Error("Attendance session not found")
  }

  // Check if attendance is submitted
  if (attendance.status !== "submitted") {
    res.status(400)
    throw new Error("Attendance must be submitted before it can be approved")
  }

  // Update attendance status
  attendance.status = "approved"
  attendance.approvedBy = req.user._id
  attendance.approvedAt = new Date()

  const updatedAttendance = await attendance.save()

  res.json({
    message: "Attendance approved successfully",
    attendance: updatedAttendance,
  })
})

// @desc    Get all submitted attendance sessions (for department head)
// @route   GET /api/attendance/submitted
// @access  Private/DepHead
const getSubmittedAttendance = asyncHandler(async (req, res) => {
  const { department } = req.query

  // Build filter object
  const filter = { status: "submitted" }
  if (department) filter.department = department

  const attendanceSessions = await Attendance.find(filter)
    .populate("instructor", "firstName lastName")
    .sort({ submittedAt: -1 })

  res.json(attendanceSessions)
})

// @desc    Get all approved attendance sessions (for department head)
// @route   GET /api/attendance/approved
// @access  Private/DepHead
const getApprovedAttendance = asyncHandler(async (req, res) => {
  const { department } = req.query

  // Build filter object
  const filter = { status: "approved" }
  if (department) filter.department = department

  const attendanceSessions = await Attendance.find(filter)
    .populate("instructor", "firstName lastName")
    .populate("approvedBy", "firstName lastName")
    .sort({ approvedAt: -1 })

  res.json(attendanceSessions)
})

export {
  createAttendance,
  getAttendanceSessions,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
  submitAttendance,
  approveAttendance,
  getSubmittedAttendance,
  getApprovedAttendance,
}

