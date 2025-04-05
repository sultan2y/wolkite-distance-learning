import asyncHandler from "express-async-handler"
import Payment from "../models/Payment.js"
import User from "../models/User.js"

// @desc    Submit payment details
// @route   POST /api/payments
// @access  Private/Student
const submitPayment = asyncHandler(async (req, res) => {
  const { amount, receiptNumber, bankName, paymentDate } = req.body
  const student = req.user._id

  // Validate input
  if (!amount || !receiptNumber || !bankName || !paymentDate) {
    res.status(400)
    throw new Error("Please fill all required fields")
  }

  // Check if receipt image was uploaded
  if (!req.file) {
    res.status(400)
    throw new Error("Please upload receipt image")
  }

  // Create payment record
  const payment = await Payment.create({
    student,
    amount,
    receiptNumber,
    bankName,
    paymentDate: new Date(paymentDate),
    receiptImage: req.file.path,
  })

  // Update user payment status
  await User.findByIdAndUpdate(student, { paymentStatus: "pending" })

  res.status(201).json({ message: "Payment submitted successfully", payment })
})

// @desc    Get all pending payments
// @route   GET /api/payments/pending
// @access  Private/Admin
const getPendingPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ status: "pending" }).populate("student", "firstName lastName userId username")
  res.json(payments)
})

// @desc    Verify payment
// @route   PUT /api/payments/:id/verify
// @access  Private/Admin
const verifyPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)

  if (!payment) {
    res.status(404)
    throw new Error("Payment not found")
  }

  // Update payment status
  payment.status = "verified"
  payment.verifiedBy = req.user._id
  payment.verificationDate = Date.now()
  await payment.save()

  // Update user payment status
  await User.findByIdAndUpdate(payment.student, { paymentStatus: "verified" })

  res.json({ message: "Payment verified successfully", payment })
})

// @desc    Reject payment
// @route   PUT /api/payments/:id/reject
// @access  Private/Admin
const rejectPayment = asyncHandler(async (req, res) => {
  const { rejectionReason } = req.body
  const payment = await Payment.findById(req.params.id)

  if (!payment) {
    res.status(404)
    throw new Error("Payment not found")
  }

  if (!rejectionReason) {
    res.status(400)
    throw new Error("Please provide a reason for rejection")
  }

  // Update payment status
  payment.status = "rejected"
  payment.verifiedBy = req.user._id
  payment.verificationDate = Date.now()
  payment.rejectionReason = rejectionReason
  await payment.save()

  // Update user payment status back to unpaid
  await User.findByIdAndUpdate(payment.student, { paymentStatus: "unpaid" })

  res.json({ message: "Payment rejected", payment })
})

// @desc    Get student payment status
// @route   GET /api/payments/status
// @access  Private/Student
const getPaymentStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  const payment = await Payment.findOne({ student: req.user._id }).sort({ createdAt: -1 })

  res.json({
    paymentStatus: user.paymentStatus,
    payment: payment || null,
  })
})

export { submitPayment, getPendingPayments, verifyPayment, rejectPayment, getPaymentStatus }

