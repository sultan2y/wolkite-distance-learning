import mongoose from "mongoose"

const courseSchema = mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: true,
      unique: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    creditHours: {
      type: Number,
      required: true,
    },
    prerequisite: {
      type: String,
      default: "None",
    },
    semester: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

const Course = mongoose.model("Course", courseSchema)

export default Course

