import express from "express"
import multer from "multer"
import path from "path"
import { uploadModule, getModules, deleteModule, downloadModule } from "../controllers/moduleController.js"
import { protect, admin } from "../middleware/authMiddleware.js"

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/modules/")
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
  },
})

function checkFileType(file, cb) {
  const filetypes = /pdf|doc|docx|ppt|pptx|txt/
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = filetypes.test(file.mimetype)

  if (extname && mimetype) {
    return cb(null, true)
  } else {
    cb("Only PDF, DOC, DOCX, PPT, PPTX, and TXT files are allowed!")
  }
}

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb)
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
})

router.route("/").get(protect, getModules)

router.route("/upload").post(protect, admin, upload.single("file"), uploadModule)

router.route("/:id").delete(protect, admin, deleteModule)

router.route("/:id/download").get(protect, downloadModule)

export default router

