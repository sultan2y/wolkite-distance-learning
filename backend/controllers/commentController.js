import asyncHandler from "express-async-handler"
import Comment from "../models/Comment.js"

// @desc    Get all comments
// @route   GET /api/admin/comments
// @access  Private/Admin
const getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({}).populate("admin", "username").sort({ createdAt: -1 })

  res.json(comments)
})

// @desc    Create a new comment
// @route   POST /api/admin/comments
// @access  Private/Admin
const createComment = asyncHandler(async (req, res) => {
  const { comment } = req.body

  if (!comment) {
    res.status(400)
    throw new Error("Comment is required")
  }

  const newComment = await Comment.create({
    admin: req.user._id,
    comment,
  })

  const populatedComment = await Comment.findById(newComment._id).populate("admin", "username")

  res.status(201).json(populatedComment)
})

// @desc    Delete a comment
// @route   DELETE /api/admin/comments/:id
// @access  Private/Admin
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id)

  if (!comment) {
    res.status(404)
    throw new Error("Comment not found")
  }

  await comment.deleteOne()
  res.json({ message: "Comment deleted successfully" })
})

export { getComments, createComment, deleteComment }

