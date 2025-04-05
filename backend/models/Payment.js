import mongoose from "mongoose"

const paymentSchema = mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    receiptNumber: {
      type: String,
      required: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    submissionDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verificationDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    receiptImage: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

const Payment = mongoose.model("Payment", paymentSchema)

export default Payment

