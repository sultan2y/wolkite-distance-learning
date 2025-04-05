import asyncHandler from "express-async-handler"
import fs from "fs"
import path from "path"
import Material from "../models/Material.js"

// @desc    Upload educational material (module, assignment, video)
// @route   POST /api/materials
// @access  Private/Instructor
const uploadMaterial = asyncHandler(async (req, res) => {
  const { title, description, type, course, department, semester, year, dueDate } = req.body

  // Validate input
  if (!title || !description || !type || !course || !department || !semester || !year) {
    res.status(400)
    throw new Error("Please fill all required fields")
  }

  // Check if file was uploaded
  if (!req.file) {
    res.status(400)
    throw new Error("Please upload a file")
  }

  // Create material record
  const material = await Material.create({
    title,
    description,
    type,
    course,
    department,
    semester,
    year,
    dueDate: type === "assignment" && dueDate ? dueDate : null,
    filePath: req.file.path,
    fileType: req.file.mimetype,
    fileSize: req.file.size,
    uploadedBy: req.user._id,
  })

  res.status(201).json({
    message: "Material uploaded successfully",
    material,
  })
})

// @desc    Get all materials (with filters)
// @route   GET /api/materials
// @access  Private
const getMaterials = asyncHandler(async (req, res) => {
  const { type, course, department, semester, year } = req.query

  // Build filter object
  const filter = {}
  if (type) filter.type = type
  if (course) filter.course = course
  if (department) filter.department = department
  if (semester) filter.semester = semester
  if (year) filter.year = year

  // For instructors, only show their own uploads
  if (req.user.role === "instructor") {
    filter.uploadedBy = req.user._id
  }

  const materials = await Material.find(filter).populate("uploadedBy", "firstName lastName").sort({ createdAt: -1 })

  res.json(materials)
})

// @desc    Get material by ID
// @route   GET /api/materials/:id
// @access  Private
const getMaterialById = asyncHandler(async (req, res) => {
  const material = await Material.findById(req.params.id).populate("uploadedBy", "firstName lastName")

  if (material) {
    res.json(material)
  } else {
    res.status(404)
    throw new Error("Material not found")
  }
})

// @desc    Download material file
// @route   GET /api/materials/:id/download
// @access  Private
const downloadMaterial = asyncHandler(async (req, res) => {
  const material = await Material.findById(req.params.id)

  if (!material) {
    res.status(404)
    throw new Error("Material not found")
  }

  const filePath = path.resolve(material.filePath)

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    res.status(404)
    throw new Error("File not found")
  }

  // Get file name from path
  const fileName = path.basename(filePath)

  // Set headers for file download
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`)
  res.setHeader("Content-Type", material.fileType)

  // Create read stream and pipe to response
  const fileStream = fs.createReadStream(filePath)
  fileStream.pipe(res)
})

// @desc    Delete material
// @route   DELETE /api/materials/:id
// @access  Private/Instructor
const deleteMaterial = asyncHandler(async (req, res) => {
  const material = await Material.findById(req.params.id)

  if (!material) {
    res.status(404)
    throw new Error("Material not found")
  }

  // Check if user is the uploader
  if (material.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(401)
    throw new Error("Not authorized to delete this material")
  }

  // Delete file from storage
  const filePath = path.resolve(material.filePath)
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }

  // Delete material from database
  await material.deleteOne()

  res.json({ message: "Material deleted successfully" })
})

export { uploadMaterial, getMaterials, getMaterialById, downloadMaterial, deleteMaterial }

