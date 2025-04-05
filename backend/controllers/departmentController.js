import asyncHandler from "express-async-handler"
import Department from "../models/Department.js"

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find({})
  res.json(departments)
})

// @desc    Create a department
// @route   POST /api/departments
// @access  Private/Admin
const createDepartment = asyncHandler(async (req, res) => {
  const { name, faculty, departmentId } = req.body

  const departmentExists = await Department.findOne({ name })

  if (departmentExists) {
    res.status(400)
    throw new Error("Department already exists")
  }

  const department = await Department.create({
    name,
    faculty,
    departmentId,
  })

  if (department) {
    res.status(201).json({
      _id: department._id,
      name: department.name,
      faculty: department.faculty,
      departmentId: department.departmentId,
    })
  } else {
    res.status(400)
    throw new Error("Invalid department data")
  }
})

export { getDepartments, createDepartment }

