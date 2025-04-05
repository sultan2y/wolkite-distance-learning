import asyncHandler from "express-async-handler"
import Feedback from "../models/Feedback.js"

// @desc    Get all feedback
// @route   GET /api/feedback
// @access  Private/Admin
const getAllFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.find({}).sort({ createdAt: -1 })
  res.json(feedback)
})

// @desc    Create new feedback
// @route   POST /api/feedback
// @access  Public
const createFeedback = asyncHandler(async (req, res) => {
  const { name, gender, email, comment } = req.body

  if (!name || !email || !comment) {
    res.status(400)
    throw new Error("Please fill all required fields")
  }

  const feedback = await Feedback.create({
    name,
    gender,
    email,
    comment,
  })

  if (feedback) {
    res.status(201).json({ message: "Feedback submitted successfully" })
  } else {
    res.status(400)
    throw new Error("Invalid feedback data")
  }
})

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private/Admin
const deleteFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id)

  if (feedback) {
    await feedback.remove()
    res.json({ message: "Feedback removed" })
  } else {
    res.status(404)
    throw new Error("Feedback not found")
  }
})

export { getAllFeedback, createFeedback, deleteFeedback }

