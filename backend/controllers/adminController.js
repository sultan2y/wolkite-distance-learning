import asyncHandler from "express-async-handler"
import User from "../models/User.js"
import Feedback from "../models/Feedback.js"
import Result from "../models/Result.js"

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = asyncHandler(async (req, res) => {
  // Count total students
  const totalStudents = await User.countDocuments({ role: "student" })

  // Count total results
  const totalResults = await Result.countDocuments()

  // Count pending results
  const pendingResults = await Result.countDocuments({ status: "Pending" })

  res.json({
    totalStudents,
    totalResults,
    pendingResults,
  })
})

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private/Admin
const getStudents = asyncHandler(async (req, res) => {
  const students = await User.find({ role: "student" }).select("userId username isActive").sort({ username: 1 })

  res.json(students)
})

// @desc    Update student status (activate/deactivate)
// @route   PUT /api/admin/students/:id/status
// @access  Private/Admin
const updateStudentStatus = asyncHandler(async (req, res) => {
  const { action } = req.body

  if (!action || (action !== "activate" && action !== "deactivate")) {
    res.status(400)
    throw new Error("Invalid action. Must be 'activate' or 'deactivate'")
  }

  const student = await User.findOne({ userId: req.params.id, role: "student" })

  if (!student) {
    res.status(404)
    throw new Error("Student not found")
  }

  student.isActive = action === "activate"
  await student.save()

  res.json({
    message: `Student ${action}d successfully`,
    student: {
      userId: student.userId,
      username: student.username,
      isActive: student.isActive,
    },
  })
})

// @desc    View all comments/feedback
// @route   GET /api/admin/comments
// @access  Private/Admin
const viewComments = asyncHandler(async (req, res) => {
  const comments = await Feedback.find({}).sort({ createdAt: -1 })
  res.json(comments)
})

// @desc    Delete a comment
// @route   DELETE /api/admin/comments/:id
// @access  Private/Admin
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Feedback.findById(req.params.id)

  if (!comment) {
    res.status(404)
    throw new Error("Comment not found")
  }

  await comment.deleteOne()
  res.json({ message: "Comment deleted successfully" })
})

export { getAdminStats, getStudents, updateStudentStatus, viewComments, deleteComment }

