import mongoose from "mongoose"

const registrationSchema = mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    semester: {
      type: String,
      required: true,
      enum: ["1", "2"],
    },
    academicYear: {
      type: String,
      required: true,
    },
    courses: [
      {
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
        creditHours: {
          type: Number,
          required: true,
        },
      },
    ],
    departmentHeadApproval: {
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      date: Date,
      comment: String,
    },
    deanApproval: {
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      date: Date,
      comment: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: function () {
        // First semester registrations are automatically approved
        return this.semester === "1" ? "approved" : "pending"
      },
    },
  },
  {
    timestamps: true,
  },
)

// Add a virtual field to determine if registration is fully approved
registrationSchema.virtual("isFullyApproved").get(function () {
  if (this.semester === "1") {
    return true // First semester is auto-approved
  }
  return this.departmentHeadApproval.status === "approved" && this.deanApproval.status === "approved"
})

const Registration = mongoose.model("Registration", registrationSchema)

export default Registration

