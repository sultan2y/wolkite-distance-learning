import asyncHandler from "express-async-handler"
import path from "path"
import fs from "fs"
import Assignment from "../models/Assignment.js"
import StudentAssignment from "../models/StudentAssignment.js"

// @desc    Get student assignments by filters
// @route   GET /api/assignments/student
// @access  Private/Instructor
const getStudentAssignments = asyncHandler(async (req, res) => {
  const { department, year, term } = req.query

  const filter = {}
  if (department) filter.department = department
  if (year) filter.year = year
  if (term) filter.term = term

  const assignments = await StudentAssignment.find(filter)

  res.json(assignments)
})

// @desc    Download student assignment file
// @route   GET /api/assignments/download/:filename
// @access  Private/Instructor
const downloadAssignment = asyncHandler(async (req, res) => {
  const filename = req.params.filename
  const filePath = path.resolve(`uploads/assignments/${filename}`)

  if (fs.existsSync(filePath)) {
    res.download(filePath)
  } else {
    res.status(404)
    throw new Error("File not found")
  }
})

// @desc    Upload instructor assignment
// @route   POST /api/assignments/instructor
// @access  Private/Instructor
const uploadInstructorAssignment = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400)
    throw new Error("Please upload a file")
  }

  const { courseName, department, year, term, deadlineDate } = req.body

  if (!courseName || !department || !year || !term || !deadlineDate) {
    res.status(400)
    throw new Error("All fields are required")
  }

  const assignment = await Assignment.create({
    courseName,
    department,
    year,
    term,
    deadlineDate,
    submissionDate: new Date(),
    filename: req.file.filename,
    filepath: req.file.path,
    uploadedBy: req.user._id,
  })

  if (assignment) {
    res.status(201).json({
      message: "Assignment uploaded successfully",
      assignment,
    })
  } else {
    res.status(400)
    throw new Error("Invalid assignment data")
  }
})

// @desc    Upload student assignment
// @route   POST /api/assignments/student
// @access  Private/Student
const uploadStudentAssignment = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400)
    throw new Error("Please upload a file")
  }

  const { courseName, department, year, term, submissionDate } = req.body

  if (!courseName || !department || !year || !term) {
    res.status(400)
    throw new Error("All fields are required")
  }

  // Check if deadline has passed
  const instructorAssignment = await Assignment.findOne({
    courseName,
    department,
    year,
    term,
  })

  if (instructorAssignment) {
    const deadlineDate = new Date(instructorAssignment.deadlineDate)
    const currentDate = new Date()

    if (currentDate > deadlineDate) {
      res.status(400)
      throw new Error("Submission deadline has passed")
    }
  }

  const studentAssignment = await StudentAssignment.create({
    userId: req.user.userId,
    courseName,
    department,
    year,
    term,
    submissionDate: submissionDate || new Date(),
    filename: req.file.filename,
    filepath: req.file.path,
    fileSize: req.file.size,
    fileType: req.file.mimetype,
  })

  if (studentAssignment) {
    res.status(201).json({
      message: "Assignment submitted successfully",
      studentAssignment,
    })
  } else {
    res.status(400)
    throw new Error("Invalid assignment data")
  }
})

// @desc    Get instructor assignments
// @route   GET /api/assignments/instructor
// @access  Private/Student
const getInstructorAssignments = asyncHandler(async (req, res) => {
  const { department, year, term } = req.query

  const filter = {}
  if (department) filter.department = department
  if (year) filter.year = year
  if (term) filter.term = term

  const assignments = await Assignment.find(filter).populate("uploadedBy", "firstName lastName")

  res.json(assignments)
})

export {
  getStudentAssignments,
  downloadAssignment,
  uploadInstructorAssignment,
  uploadStudentAssignment,
  getInstructorAssignments,
}

