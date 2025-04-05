import asyncHandler from "express-async-handler"
import Course from "../models/Assignment.js"
import CourseRequest from "../models/CourseRequest.js"

// @desc    Get courses by filters
// @route   GET /api/courses
// @access  Private
const getCoursesByFilters = asyncHandler(async (req, res) => {
  const { department, year, semister } = req.query

  const filter = {}
  if (department) filter.department = department
  if (year) filter.year = year
  if (semister) filter.semister = semister

  const courses = await Course.find(filter)

  res.json(courses)
})

// @desc    Submit course add request
// @route   POST /api/courses/request
// @access  Private/Student
const submitCourseAddRequest = asyncHandler(async (req, res) => {
  const { department, year, semester, courseCode } = req.body

  if (!department || !year || !semester || !courseCode) {
    res.status(400)
    throw new Error("All fields are required")
  }

  // Check if course exists
  const course = await Course.findOne({ course_code: courseCode })

  if (!course) {
    res.status(404)
    throw new Error("Course not found")
  }

  // Check if request already exists
  const existingRequest = await CourseRequest.findOne({
    studentId: req.user.userId,
    courseCode,
    status: "Pending",
  })

  if (existingRequest) {
    res.status(400)
    throw new Error("You already have a pending request for this course")
  }

  const courseRequest = await CourseRequest.create({
    studentId: req.user.userId,
    courseCode,
    department,
    year,
    semester,
    requestDate: new Date(),
    status: "Pending",
  })

  if (courseRequest) {
    res.status(201).json({
      message: "Course request submitted successfully",
      courseRequest,
    })
  } else {
    res.status(400)
    throw new Error("Invalid course request data")
  }
})

// @desc    Get course requests by student
// @route   GET /api/courses/request
// @access  Private/Student
const getCourseRequestsByStudent = asyncHandler(async (req, res) => {
  const courseRequests = await CourseRequest.find({ studentId: req.user.userId })
    .populate("courseCode", "course_name")
    .sort({ requestDate: -1 })

  res.json(courseRequests)
})

// @desc    Get all course requests
// @route   GET /api/courses/request/all
// @access  Private/Admin
const getAllCourseRequests = asyncHandler(async (req, res) => {
  const courseRequests = await CourseRequest.find({}).populate("courseCode", "course_name").sort({ requestDate: -1 })

  res.json(courseRequests)
})

// @desc    Approve/Reject course request
// @route   PUT /api/courses/request/:id
// @access  Private/Admin
const updateCourseRequestStatus = asyncHandler(async (req, res) => {
  const { status } = req.body

  if (!status || !["Approved", "Rejected"].includes(status)) {
    res.status(400)
    throw new Error("Invalid status")
  }

  const courseRequest = await CourseRequest.findById(req.params.id)

  if (courseRequest) {
    courseRequest.status = status
    courseRequest.processedDate = new Date()
    courseRequest.processedBy = req.user._id

    const updatedRequest = await courseRequest.save()

    res.json(updatedRequest)
  } else {
    res.status(404)
    throw new Error("Course request not found")
  }
})

export {
  getCoursesByFilters,
  submitCourseAddRequest,
  getCourseRequestsByStudent,
  getAllCourseRequests,
  updateCourseRequestStatus,
}

