import asyncHandler from "express-async-handler"
import Module from "../models/Module.js"
import path from "path"
import fs from "fs"

// @desc    Upload module
// @route   POST /api/modules/upload
// @access  Private/Admin
const uploadModule = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400)
    throw new Error("Please upload a file")
  }

  const { courseName, department, semester, year } = req.body

  // Create module record
  const module = await Module.create({
    courseName,
    department,
    semester,
    year,
    file: req.file.path,
    fileType: req.file.mimetype,
    fileSize: req.file.size,
    uploadedBy: req.user._id,
  })

  if (module) {
    res.status(201).json({
      _id: module._id,
      courseName: module.courseName,
      department: module.department,
      semester: module.semester,
      year: module.year,
      file: module.file,
    })
  } else {
    res.status(400)
    throw new Error("Invalid module data")
  }
})

// @desc    Get all modules
// @route   GET /api/modules
// @access  Private
const getModules = asyncHandler(async (req, res) => {
  const { department, semester, year } = req.query

  const filter = {}

  if (department) filter.department = department
  if (semester) filter.semester = semester
  if (year) filter.year = year

  const modules = await Module.find(filter).sort({ createdAt: -1 })
  res.json(modules)
})

// @desc    Delete module
// @route   DELETE /api/modules/:id
// @access  Private/Admin
const deleteModule = asyncHandler(async (req, res) => {
  const module = await Module.findById(req.params.id)

  if (module) {
    // Delete file from storage
    const filePath = module.file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    await module.deleteOne()
    res.json({ message: "Module removed" })
  } else {
    res.status(404)
    throw new Error("Module not found")
  }
})

// @desc    Download module
// @route   GET /api/modules/:id/download
// @access  Private
const downloadModule = asyncHandler(async (req, res) => {
  const module = await Module.findById(req.params.id)

  if (module) {
    const filePath = module.file
    if (fs.existsSync(filePath)) {
      res.download(filePath, path.basename(filePath))
    } else {
      res.status(404)
      throw new Error("File not found")
    }
  } else {
    res.status(404)
    throw new Error("Module not found")
  }
})

export { uploadModule, getModules, deleteModule, downloadModule }

