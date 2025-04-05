import asyncHandler from "express-async-handler"
import Result from "../models/Result.js"
import Registration from "../models/Registration.js"

// @desc    Get student results
// @route   GET /api/students/grades
// @access  Private/Student
const getStudentResults = asyncHandler(async (req, res) => {
  const studentId = req.user._id

  // Get the student's approved registrations
  const approvedRegistrations = await Registration.find({
    student: studentId,
    status: "approved",
  })

  if (approvedRegistrations.length === 0) {
    return res.json([])
  }

  // Get results for the student
  const results = await Result.find({
    studentId: req.user.userId,
    status: "Approved", // Only show approved results
  })

  res.json(results)
})

// Export other functions...
export { getStudentResults }

