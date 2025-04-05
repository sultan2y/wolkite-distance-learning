import asyncHandler from "express-async-handler"

import generateToken from "../utils/generateToken.js"

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body

  const user = await User.findOne({ username, isActive: true })

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      userId: user.userId,
      username: user.username,
      role: user.role,
      token: generateToken(user._id),
    })
  } else {
    res.status(401)
    throw new Error("Invalid username or password, or account is not active")
  }
})

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      userId: user.userId,
      username: user.username,
      role: user.role,
    })
  } else {
    res.status(404)
    throw new Error("User not found")
  }
})

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    user.firstName = req.body.firstName || user.firstName
    user.lastName = req.body.lastName || user.lastName
    user.phone = req.body.phone || user.phone

    if (req.body.password) {
      user.password = req.body.password
    }

    const updatedUser = await user.save()

    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      userId: updatedUser.userId,
      username: updatedUser.username,
      role: updatedUser.role,
      token: generateToken(updatedUser._id),
    })
  } else {
    res.status(404)
    throw new Error("User not found")
  }
})

// @desc    Create a new user
// @route   POST /api/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, userId, phone, username, password, accountType } = req.body

  const userExists = await User.findOne({ $or: [{ username }, { userId }] })

  if (userExists) {
    res.status(400)
    throw new Error("User already exists")
  }

  const user = await User.create({
    firstName,
    lastName,
    userId,
    phone,
    username,
    password,
    role: accountType,
    isActive: true,
  })

  if (user) {
    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      userId: user.userId,
      username: user.username,
      role: user.role,
    })
  } else {
    res.status(400)
    throw new Error("Invalid user data")
  }
})

// @desc    Get users by account type
// @route   GET /api/users/type/:accountType
// @access  Private/Admin
const getUsersByType = asyncHandler(async (req, res) => {
  const accountType = req.params.accountType
  const users = await User.find({ role: accountType }).select("-password")

  res.json(users)
})

// @desc    Toggle user active status
// @route   PUT /api/users/toggle-status/:username
// @access  Private/Admin
const toggleUserStatus = asyncHandler(async (req, res) => {
  const username = req.params.username
  const user = await User.findOne({ username })

  if (user) {
    user.isActive = !user.isActive
    const updatedUser = await user.save()

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      isActive: updatedUser.isActive,
    })
  } else {
    res.status(404)
    throw new Error("User not found")
  }
})

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password")

  if (user) {
    res.json(user)
  } else {
    res.status(404)
    throw new Error("User not found")
  }
})

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (user) {
    user.firstName = req.body.firstName || user.firstName
    user.lastName = req.body.lastName || user.lastName
    user.userId = req.body.userId || user.userId
    user.phone = req.body.phone || user.phone
    user.username = req.body.username || user.username
    user.role = req.body.role || user.role

    const updatedUser = await user.save()

    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      userId: updatedUser.userId,
      username: updatedUser.username,
      role: updatedUser.role,
    })
  } else {
    res.status(404)
    throw new Error("User not found")
  }
})

// @desc    Reset user password
// @route   PUT /api/users/:id/reset-password
// @access  Private/Admin
const resetPassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (user) {
    user.password = req.body.password

    await user.save()

    res.json({ message: "Password reset successfully" })
  } else {
    res.status(404)
    throw new Error("User not found")
  }
})

export {
  authUser,
  getUserProfile,
  updateUserProfile,
  createUser,
  getUsersByType,
  toggleUserStatus,
  getUserById,
  updateUser,
  resetPassword,
}

