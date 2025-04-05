import asyncHandler from "express-async-handler"
import Registration from "../models/Registration.js"
import Course from "../models/Course.js"
import User from "../models/User.js"

// @desc    Register for a semester
// @route   POST /api/registrations
// @access  Private/Student
const registerForSemester = asyncHandler(async (req, res) => {
  const { semester, academicYear, courses } = req.body
  const studentId = req.user._id

  // Validate courses exist
  for (const courseItem of courses) {
    const course = await Course.findById(courseItem.course)
    if (!course) {
      res.status(404)
      throw new Error(`Course with ID ${courseItem.course} not found`)
    }
  }

  // Check if student already registered for this semester and year
  const existingRegistration = await Registration.findOne({
    student: studentId,
    semester,
    academicYear,
  })

  if (existingRegistration) {
    res.status(400)
    throw new Error(`You have already registered for semester ${semester} of ${academicYear}`)
  }

  // Create registration
  const registration = await Registration.create({
    student: studentId,
    semester,
    academicYear,
    courses,
    // First semester is auto-approved, second semester needs approvals
    status: semester === "1" ? "approved" : "pending",
  })

  if (registration) {
    res.status(201).json(registration)
  } else {
    res.status(400)
    throw new Error("Invalid registration data")
  }
})

// @desc    Get student's registrations
// @route   GET /api/registrations
// @access  Private/Student
const getMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({ student: req.user._id }).populate(
    "courses.course",
    "courseCode courseName creditHours",
  )

  res.json(registrations)
})

// @desc    Get registrations pending department head approval
// @route   GET /api/registrations/department-head-pending
// @access  Private/DepartmentHead
const getPendingDepartmentHeadApprovals = asyncHandler(async (req, res) => {
  // Get students from the department head's department
  const departmentHead = await User.findById(req.user._id)

  // Find registrations for second semester that need department head approval
  const registrations = await Registration.find({
    semester: "2",
    "departmentHeadApproval.status": "pending",
  }).populate("student", "firstName lastName userId")

  res.json(registrations)
})

// @desc    Department head approve/reject registration
// @route   PUT /api/registrations/:id/department-head-approval
// @access  Private/DepartmentHead
const departmentHeadApproval = asyncHandler(async (req, res) => {
  const { status, comment } = req.body

  const registration = await Registration.findById(req.params.id)

  if (!registration) {
    res.status(404)
    throw new Error("Registration not found")
  }

  registration.departmentHeadApproval = {
    status,
    date: Date.now(),
    comment: comment || "",
  }

  // Update overall status if rejected
  if (status === "rejected") {
    registration.status = "rejected"
  }

  const updatedRegistration = await registration.save()
  res.json(updatedRegistration)
})

// @desc    Get registrations pending dean approval
// @route   GET /api/registrations/dean-pending
// @access  Private/Dean
const getPendingDeanApprovals = asyncHandler(async (req, res) => {
  // Find registrations that have department head approval but need dean approval
  const registrations = await Registration.find({
    semester: "2",
    "departmentHeadApproval.status": "approved",
    "deanApproval.status": "pending",
  }).populate("student", "firstName lastName userId")

  res.json(registrations)
})

// @desc    Dean approve/reject registration
// @route   PUT /api/registrations/:id/dean-approval
// @access  Private/Dean
const deanApproval = asyncHandler(async (req, res) => {
  const { status, comment } = req.body

  const registration = await Registration.findById(req.params.id)

  if (!registration) {
    res.status(404)
    throw new Error("Registration not found")
  }

  registration.deanApproval = {
    status,
    date: Date.now(),
    comment: comment || "",
  }

  // Update overall status
  if (status === "approved") {
    registration.status = "approved"
  } else if (status === "rejected") {
    registration.status = "rejected"
  }

  const updatedRegistration = await registration.save()
  res.json(updatedRegistration)
})

export {
  registerForSemester,
  getMyRegistrations,
  getPendingDepartmentHeadApprovals,
  departmentHeadApproval,
  getPendingDeanApprovals,
  deanApproval,
}

