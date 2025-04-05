import asyncHandler from "express-async-handler"
import InstructorAssignment from "../models/InstructorAssignment.js"

// @desc    Get assigned instructors by department, year, and semester
// @route   GET /api/instructors/assigned
// @access  Private
const getAssignedInstructors = asyncHandler(async (req, res) => {
  const { department, year, semester } = req.query

  // Validate required query parameters
  if (!department || !year || !semester) {
    res.status(400)
    throw new Error("Department, year, and semester are required")
  }

  // Find instructor assignments
  const assignments = await InstructorAssignment.find({
    department,
    year,
    semester,
  })
    .populate("instructor", "firstName lastName phone")
    .populate("course", "courseName courseCode")

  res.json(assignments)
})

export { getAssignedInstructors }

