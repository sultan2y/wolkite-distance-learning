import asyncHandler from "express-async-handler"
import fs from "fs"
import path from "path"
import Submission from "../models/Submission.js"
import Material from "../models/Material.js"

// @desc    Submit assignment
// @route   POST /api/submissions
// @access  Private/Student
const submitAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.body

  // Validate input
  if (!assignmentId) {
    res.status(400)
    throw new Error("Assignment ID is required")
  }

  // Check if file was uploaded
  if (!req.file) {
    res.status(400)
    throw new Error("Please upload a file")
  }

  // Check if assignment exists
  const assignment = await Material.findById(assignmentId)
  if (!assignment) {
    res.status(404)
    throw new Error("Assignment not found")
  }

  // Check if assignment is of type 'assignment'
  if (assignment.type !== "assignment") {
    res.status(400)
    throw new Error("Material is not an assignment")
  }

  // Check if due date has passed
  if (assignment.dueDate && new Date() > new Date(assignment.dueDate)) {
    res.status(400)
    throw new Error("Assignment due date has passed")
  }

  // Check if student has already submitted this assignment
  const existingSubmission = await Submission.findOne({
    assignment: assignmentId,
    student: req.user._id,
  })

  if (existingSubmission) {
    // Delete previous submission file
    if (fs.existsSync(existingSubmission.filePath)) {
      fs.unlinkSync(existingSubmission.filePath)
    }

    // Update existing submission
    existingSubmission.filePath = req.file.path
    existingSubmission.fileType = req.file.mimetype
    existingSubmission.fileSize = req.file.size
    existingSubmission.submissionDate = Date.now()
    existingSubmission.status = "submitted"
    existingSubmission.grade = undefined
    existingSubmission.feedback = undefined

    const updatedSubmission = await existingSubmission.save()

    res.json({
      message: "Assignment resubmitted successfully",
      submission: updatedSubmission,
    })
  } else {
    // Create new submission
    const submission = await Submission.create({
      assignment: assignmentId,
      student: req.user._id,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    })

    res.status(201).json({
      message: "Assignment submitted successfully",
      submission,
    })
  }
})

// @desc    Get submissions for an assignment
// @route   GET /api/submissions/assignment/:id
// @access  Private/Instructor
const getSubmissionsByAssignment = asyncHandler(async (req, res) => {
  const assignmentId = req.params.id

  // Check if assignment exists and belongs to the instructor
  const assignment = await Material.findById(assignmentId)
  if (!assignment) {
    res.status(404)
    throw new Error("Assignment not found")
  }

  // Only allow the instructor who uploaded the assignment to view submissions
  if (assignment.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(401)
    throw new Error("Not authorized to view these submissions")
  }

  const submissions = await Submission.find({ assignment: assignmentId })
    .populate("student", "firstName lastName userId")
    .sort({ submissionDate: -1 })

  res.json(submissions)
})

// @desc    Get student's submissions
// @route   GET /api/submissions/student
// @access  Private/Student
const getStudentSubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({ student: req.user._id })
    .populate({
      path: "assignment",
      select: "title description course dueDate",
      populate: {
        path: "uploadedBy",
        select: "firstName lastName",
      },
    })
    .sort({ submissionDate: -1 })

  res.json(submissions)
})

// @desc    Download submission file
// @route   GET /api/submissions/:id/download
// @access  Private
const downloadSubmission = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id).populate("assignment")

  if (!submission) {
    res.status(404)
    throw new Error("Submission not found")
  }

  // Check if user is authorized to download
  const isInstructor = submission.assignment.uploadedBy.toString() === req.user._id.toString()
  const isStudent = submission.student.toString() === req.user._id.toString()
  const isAdmin = req.user.role === "admin"

  if (!isInstructor && !isStudent && !isAdmin) {
    res.status(401)
    throw new Error("Not authorized to download this submission")
  }

  const filePath = path.resolve(submission.filePath)

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    res.status(404)
    throw new Error("File not found")
  }

  // Get file name from path
  const fileName = path.basename(filePath)

  // Set headers for file download
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`)
  res.setHeader("Content-Type", submission.fileType)

  // Create read stream and pipe to response
  const fileStream = fs.createReadStream(filePath)
  fileStream.pipe(res)
})

// @desc    Grade submission
// @route   PUT /api/submissions/:id/grade
// @access  Private/Instructor
const gradeSubmission = asyncHandler(async (req, res) => {
  const { grade, feedback } = req.body

  if (grade === undefined || grade === null) {
    res.status(400)
    throw new Error("Grade is required")
  }

  const submission = await Submission.findById(req.params.id).populate("assignment")

  if (!submission) {
    res.status(404)
    throw new Error("Submission not found")
  }

  // Check if user is the instructor who created the assignment
  if (submission.assignment.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(401)
    throw new Error("Not authorized to grade this submission")
  }

  // Update submission
  submission.grade = grade
  submission.feedback = feedback || ""
  submission.status = "graded"

  const updatedSubmission = await submission.save()

  res.json({
    message: "Submission graded successfully",
    submission: updatedSubmission,
  })
})

export { submitAssignment, getSubmissionsByAssignment, getStudentSubmissions, downloadSubmission, gradeSubmission }

