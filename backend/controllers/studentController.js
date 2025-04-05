import asyncHandler from "express-async-handler"
import Student from "../models/Student.js"
import User from "../models/User.js"

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin
const getStudents = asyncHandler(async (req, res) => {
  const students = await Student.find({}).populate("user", "firstName lastName username")
  res.json(students)
})

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private/Admin
const getStudentById = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id).populate("user", "firstName lastName username")

  if (student) {
    res.json(student)
  } else {
    res.status(404)
    throw new Error("Student not found")
  }
})

// @desc    Create a student
// @route   POST /api/students
// @access  Private/Admin
const createStudent = asyncHandler(async (req, res) => {
  const {
    userId,
    firstName,
    middleName,
    lastName,
    birthDate,
    sex,
    town,
    woreda,
    address,
    email,
    department,
    phone,
    semester,
    year,
    username,
    password,
  } = req.body

  // Check if user already exists
  const userExists = await User.findOne({ username })

  if (userExists) {
    res.status(400)
    throw new Error("User already exists")
  }

  // Create user first
  const user = await User.create({
    firstName,
    lastName,
    userId,
    phone,
    username,
    password,
    role: "student",
    status: 6,
    isActive: true,
  })

  if (user) {
    // Create student profile
    const student = await Student.create({
      user: user._id,
      studentId: userId,
      firstName,
      middleName,
      lastName,
      birthDate,
      sex,
      town,
      woreda,
      address,
      email,
      department,
      phone,
      semester,
      year,
    })

    if (student) {
      res.status(201).json({
        _id: student._id,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
        },
        studentId: student.studentId,
        firstName: student.firstName,
        middleName: student.middleName,
        lastName: student.lastName,
        department: student.department,
      })
    } else {
      // If student creation fails, delete the user
      await User.findByIdAndDelete(user._id)
      res.status(400)
      throw new Error("Invalid student data")
    }
  } else {
    res.status(400)
    throw new Error("Invalid user data")
  }
})

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private/Admin
const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id)

  if (student) {
    student.firstName = req.body.firstName || student.firstName
    student.middleName = req.body.middleName || student.middleName
    student.lastName = req.body.lastName || student.lastName
    student.birthDate = req.body.birthDate || student.birthDate
    student.sex = req.body.sex || student.sex
    student.town = req.body.town || student.town
    student.woreda = req.body.woreda || student.woreda
    student.address = req.body.address || student.address
    student.email = req.body.email || student.email
    student.department = req.body.department || student.department
    student.phone = req.body.phone || student.phone
    student.semester = req.body.semester || student.semester
    student.year = req.body.year || student.year

    const updatedStudent = await student.save()

    // Update user information if provided
    if (req.body.firstName || req.body.lastName || req.body.phone) {
      const user = await User.findById(student.user)

      if (user) {
        user.firstName = req.body.firstName || user.firstName
        user.lastName = req.body.lastName || user.lastName
        user.phone = req.body.phone || user.phone

        await user.save()
      }
    }

    res.json(updatedStudent)
  } else {
    res.status(404)
    throw new Error("Student not found")
  }
})

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private/Admin
const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id)

  if (student) {
    // Delete user account
    await User.findByIdAndDelete(student.user)

    // Delete student profile
    await student.deleteOne()

    res.json({ message: "Student removed" })
  } else {
    res.status(404)
    throw new Error("Student not found")
  }
})

// @desc    Get students by department
// @route   GET /api/students/department/:department
// @access  Private/Admin
const getStudentsByDepartment = asyncHandler(async (req, res) => {
  const students = await Student.find({ department: req.params.department }).populate(
    "user",
    "firstName lastName username",
  )
  res.json(students)
})

export { getStudents, getStudentById, createStudent, updateStudent, deleteStudent, getStudentsByDepartment }

