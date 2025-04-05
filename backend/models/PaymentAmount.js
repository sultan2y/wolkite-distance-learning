import mongoose from "mongoose"

const paymentAmountSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["semester", "year"],
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

const PaymentAmount = mongoose.model("PaymentAmount", paymentAmountSchema)

export default PaymentAmount

