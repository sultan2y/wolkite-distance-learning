import asyncHandler from "express-async-handler"
import Applicant from "../models/Applicant.js"
import User from "../models/User.js"

// @desc    Get all applicants
// @route   GET /api/applicants
// @access  Private/Admin
const getApplicants = asyncHandler(async (req, res) => {
  const department = req.query.department || ""
  const departmentFilter = department ? { department } : {}

  const applicants = await Applicant.find({
    ...departmentFilter,
    status: "Pending",
  })

  res.json(applicants)
})

// @desc    Get applicant by ID
// @route   GET /api/applicants/:id
// @access  Private/Admin
const getApplicantById = asyncHandler(async (req, res) => {
  const applicant = await Applicant.findById(req.params.id)

  if (applicant) {
    res.json(applicant)
  } else {
    res.status(404)
    throw new Error("Applicant not found")
  }
})

// @desc    Approve applicant
// @route   PUT /api/applicants/:id/approve
// @access  Private/Admin
const approveApplicant = asyncHandler(async (req, res) => {
  const applicant = await Applicant.findById(req.params.id)

  if (applicant) {
    // Create a new user account for the approved applicant
    const user = await User.create({
      firstName: applicant.firstName,
      lastName: applicant.lastName,
      email: applicant.email,
      password: "123456", // Default password, should be changed on first login
      role: "student",
      department: applicant.department,
      phone: applicant.phone,
      isActive: true,
    })

    // Update applicant status
    applicant.status = "Approved"
    await applicant.save()

    res.json({ message: "Applicant approved successfully" })
  } else {
    res.status(404)
    throw new Error("Applicant not found")
  }
})

// @desc    Reject applicant
// @route   PUT /api/applicants/:id/reject
// @access  Private/Admin
const rejectApplicant = asyncHandler(async (req, res) => {
  const applicant = await Applicant.findById(req.params.id)

  if (applicant) {
    applicant.status = "Rejected"
    await applicant.save()

    res.json({ message: "Applicant rejected successfully" })
  } else {
    res.status(404)
    throw new Error("Applicant not found")
  }
})

export { getApplicants, getApplicantById, approveApplicant, rejectApplicant }

