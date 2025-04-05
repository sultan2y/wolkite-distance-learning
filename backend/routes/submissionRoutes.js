import express from "express"
import multer from "multer"
import path from "path"
import {
  submitAssignment,
  getSubmissionsByAssignment,
  getStudentSubmissions,
  downloadSubmission,
  gradeSubmission,
} from "../controllers/submissionController.js"
import { protect, instructor, student } from "../middleware/authMiddleware.js"

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/submissions/")
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`)
  },
})

function checkFileType(file, cb) {
  // Allow various file types for submissions
  const filetypes = /pdf|doc|docx|ppt|pptx|xls|xlsx|txt|jpg|jpeg|png|gif|zip|rar/
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = filetypes.test(file.mimetype)

  if (extname || mimetype) {
    return cb(null, true)
  } else {
    cb("Error: Unsupported file type!")
  }
}

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb)
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
})

router
  .route("/")
  .post(protect, student, upload.single("file"), submitAssignment)
  .get(protect, student, getStudentSubmissions)

router.route("/assignment/:id").get(protect, instructor, getSubmissionsByAssignment)

router.route("/:id/download").get(protect, downloadSubmission)

router.route("/:id/grade").put(protect, instructor, gradeSubmission)

export default router

