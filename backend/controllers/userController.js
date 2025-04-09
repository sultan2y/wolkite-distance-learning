import asyncHandler from "express-async-handler"
import User from "../models/User.js"
import generateToken from "../utils/generateToken.js"

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body

  const user = await User.findOne({ username })

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      userId: user.userId,
      username: user.username,
      role: user.role,
      isActive: user.isActive,
      token: generateToken(user._id),
    })
  } else {
    res.status(401)
    throw new Error("Invalid username or password")
  }
})

// @desc    Get all deactivated users
// @route   GET /api/users/deactivated
// @access  Private/Admin
const getDeactivatedUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ isActive: false })
  res.json(users)
})

// @desc    Get all active users
// @route   GET /api/users/active
// @access  Private/Admin
const getActiveUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ isActive: true })
  res.json(users)
})

// @desc    Toggle user active status
// @route   PUT /api/users/:id/toggle-status
// @access  Private/Admin
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (user) {
    user.isActive = !user.isActive
    const updatedUser = await user.save()
    res.json(updatedUser)
  } else {
    res.status(404)
    throw new Error("User not found")
  }
})

export { authUser, getDeactivatedUsers, getActiveUsers, toggleUserStatus }