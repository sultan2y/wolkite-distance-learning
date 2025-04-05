import express from "express"
import multer from "multer"
import path from "path"
import {
  getStudentAssignments,
  downloadAssignment,
  uploadInstructorAssignment,
  uploadStudentAssignment,
  getInstructorAssignments,
} from "../controllers/assignmentController.js"
import { protect, instructor, student } from "../middleware/authMiddleware.js"

const router = express.Router()

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/assignments/")
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|doc|docx|ppt|pptx|txt|zip|rar|jpg|jpeg|png/
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = filetypes.test(file.mimetype)

    if (extname && mimetype) {
      return cb(null, true)
    } else {
      cb(new Error("Only PDF, DOC, DOCX, PPT, PPTX, TXT, ZIP, RAR, JPG, JPEG, and PNG files are allowed!"))
    }
  },
})

router
  .route("/student")
  .get(protect, instructor, getStudentAssignments)
  .post(protect, student, upload.single("file"), uploadStudentAssignment)

router
  .route("/instructor")
  .get(protect, getInstructorAssignments)
  .post(protect, instructor, upload.single("file"), uploadInstructorAssignment)

router.route("/download/:filename").get(protect, downloadAssignment)

export default router

