import mongoose from "mongoose"

const resultSchema = mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
    },
    courseCode: {
      type: String,
      required: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    semester: {
      type: String,
      required: true,
    },
    creditHour: {
      type: Number,
      required: true,
    },
    assignment: {
      type: Number,
      required: true,
    },
    final: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    grade: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "Pending",
      enum: ["Pending", "Approved"],
    },
  },
  {
    timestamps: true,
  },
)

const Result = mongoose.model("Result", resultSchema)

export default Result

