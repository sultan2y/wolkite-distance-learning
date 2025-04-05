import mongoose from "mongoose"

const feedbackSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

const Feedback = mongoose.model("Feedback", feedbackSchema)

export default Feedback

