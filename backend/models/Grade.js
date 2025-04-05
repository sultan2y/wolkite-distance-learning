import mongoose from "mongoose"

const gradeSchema = mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Course",
    },
    courseCode: {
      type: String,
      required: true,
    },
    courseName: {
      type: String,
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

const Grade = mongoose.model("Grade", gradeSchema)

export default Grade

