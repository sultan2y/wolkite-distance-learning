import express from "express"
import multer from "multer"
import path from "path"
import {
  submitPayment,
  getPendingPayments,
  verifyPayment,
  rejectPayment,
  getPaymentStatus,
} from "../controllers/paymentController.js"
import { protect, admin, student } from "../middleware/authMiddleware.js"

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/receipts/")
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
  },
})

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|pdf/
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = filetypes.test(file.mimetype)

  if (extname && mimetype) {
    return cb(null, true)
  } else {
    cb("Images and PDFs only!")
  }
}

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb)
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
})

router.route("/").post(protect, student, upload.single("receiptImage"), submitPayment)
router.route("/pending").get(protect, admin, getPendingPayments)
router.route("/:id/verify").put(protect, admin, verifyPayment)
router.route("/:id/reject").put(protect, admin, rejectPayment)
router.route("/status").get(protect, student, getPaymentStatus)

export default router

