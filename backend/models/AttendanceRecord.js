import mongoose from "mongoose"

const attendanceRecordSchema = mongoose.Schema(
  {
    attendance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attendance",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "absent", "late", "excused"],
      required: true,
      default: "absent",
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

// Create a compound index to ensure a student can only have one record per attendance session
attendanceRecordSchema.index({ attendance: 1, student: 1 }, { unique: true })

const AttendanceRecord = mongoose.model("AttendanceRecord", attendanceRecordSchema)

export default AttendanceRecord

