import express from "express"
import multer from "multer"
import path from "path"
import {
  uploadMaterial,
  getMaterials,
  getMaterialById,
  downloadMaterial,
  deleteMaterial,
} from "../controllers/materialController.js"
import { protect, instructor } from "../middleware/authMiddleware.js"

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/materials/")
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`)
  },
})

function checkFileType(file, cb) {
  // Allow various file types for educational materials
  const filetypes = /pdf|doc|docx|ppt|pptx|xls|xlsx|txt|jpg|jpeg|png|gif|mp4|webm|mp3|zip|rar/
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
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
})

router.route("/").post(protect, instructor, upload.single("file"), uploadMaterial).get(protect, getMaterials)

router.route("/:id").get(protect, getMaterialById).delete(protect, instructor, deleteMaterial)

router.route("/:id/download").get(protect, downloadMaterial)

export default router

