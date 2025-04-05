import mongoose from "mongoose"

const assignmentSchema = new mongoose.Schema(
  {
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    instructorName: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    semester: {
      type: String,
      required: true,
    },
    uploadedDate: {
      type: Date,
      required: true,
    },
    deadlineDate: {
      type: Date,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

const Assignment = mongoose.model("Assignment", assignmentSchema)

export default Assignment

