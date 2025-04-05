import asyncHandler from "express-async-handler"
import Attendance from "../models/Attendance.js"
import AttendanceRecord from "../models/AttendanceRecord.js"
import User from "../models/User.js"

// @desc    Add or update attendance record for a student
// @route   POST /api/attendance/:id/records
// @access  Private/Instructor
const addAttendanceRecord = asyncHandler(async (req, res) => {
  const { studentId, status, notes } = req.body

  // Validate input
  if (!studentId || !status) {
    res.status(400)
    throw new Error("Student ID and status are required")
  }

  // Check if status is valid
  const validStatuses = ["present", "absent", "late", "excused"]
  if (!validStatuses.includes(status)) {
    res.status(400)
    throw new Error("Invalid status. Must be one of: present, absent, late, excused")
  }

  // Find attendance session
  const attendance = await Attendance.findById(req.params.id)
  if (!attendance) {
    res.status(404)
    throw new Error("Attendance session not found")
  }

  // Check if user is the instructor who created this attendance
  if (attendance.instructor.toString() !== req.user._id.toString()) {
    res.status(401)
    throw new Error("Not authorized to update this attendance")
  }

  // Check if attendance is still in draft status
  if (attendance.status !== "draft") {
    res.status(400)
    throw new Error("Cannot update attendance that has been submitted")
  }

  // Find student
  const student = await User.findOne({ userId: studentId, role: "student" })
  if (!student) {
    res.status(404)
    throw new Error("Student not found")
  }

  // Check if record already exists
  let record = await AttendanceRecord.findOne({
    attendance: attendance._id,
    student: student._id,
  })

  if (record) {
    // Update existing record
    record.status = status
    record.notes = notes !== undefined ? notes : record.notes
    await record.save()
  } else {
    // Create new record
    record = await AttendanceRecord.create({
      attendance: attendance._id,
      student: student._id,
      status,
      notes,
    })
  }

  res.status(201).json({
    message: "Attendance record updated successfully",
    record,
  })
})

// @desc    Get all attendance records for a session
// @route   GET /api/attendance/:id/records
// @access  Private
const getAttendanceRecords = asyncHandler(async (req, res) => {
  // Find attendance session
  const attendance = await Attendance.findById(req.params.id)
  if (!attendance) {
    res.status(404)
    throw new Error("Attendance session not found")
  }

  // Check if user is authorized to view these records
  if (
    attendance.instructor.toString() !== req.user._id.toString() &&
    req.user.role !== "admin" &&
    req.user.role !== "dep-head"
  ) {
    res.status(401)
    throw new Error("Not authorized to view these records")
  }

  // Get all records for this session
  const records = await AttendanceRecord.find({ attendance: attendance._id })
    .populate("student", "firstName lastName userId")
    .sort({ "student.lastName": 1, "student.firstName": 1 })

  res.json(records)
})

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id/records/:recordId
// @access  Private/Instructor
const deleteAttendanceRecord = asyncHandler(async (req, res) => {
  // Find attendance session
  const attendance = await Attendance.findById(req.params.id)
  if (!attendance) {
    res.status(404)
    throw new Error("Attendance session not found")
  }

  // Check if user is the instructor who created this attendance
  if (attendance.instructor.toString() !== req.user._id.toString()) {
    res.status(401)
    throw new Error("Not authorized to update this attendance")
  }

  // Check if attendance is still in draft status
  if (attendance.status !== "draft") {
    res.status(400)
    throw new Error("Cannot update attendance that has been submitted")
  }

  // Find and delete record
  const record = await AttendanceRecord.findById(req.params.recordId)
  if (!record) {
    res.status(404)
    throw new Error("Attendance record not found")
  }

  await record.deleteOne()

  res.json({ message: "Attendance record deleted successfully" })
})

// @desc    Bulk update attendance records
// @route   POST /api/attendance/:id/records/bulk
// @access  Private/Instructor
const bulkUpdateAttendanceRecords = asyncHandler(async (req, res) => {
  const { records } = req.body

  if (!records || !Array.isArray(records) || records.length === 0) {
    res.status(400)
    throw new Error("Records array is required")
  }

  // Find attendance session
  const attendance = await Attendance.findById(req.params.id)
  if (!attendance) {
    res.status(404)
    throw new Error("Attendance session not found")
  }

  // Check if user is the instructor who created this attendance
  if (attendance.instructor.toString() !== req.user._id.toString()) {
    res.status(401)
    throw new Error("Not authorized to update this attendance")
  }

  // Check if attendance is still in draft status
  if (attendance.status !== "draft") {
    res.status(400)
    throw new Error("Cannot update attendance that has been submitted")
  }

  // Process each record
  const results = []
  const validStatuses = ["present", "absent", "late", "excused"]

  for (const recordData of records) {
    const { studentId, status, notes } = recordData

    // Validate record data
    if (!studentId || !status) {
      results.push({
        studentId,
        success: false,
        message: "Student ID and status are required",
      })
      continue
    }

    if (!validStatuses.includes(status)) {
      results.push({
        studentId,
        success: false,
        message: "Invalid status. Must be one of: present, absent, late, excused",
      })
      continue
    }

    try {
      // Find student
      const student = await User.findOne({ userId: studentId, role: "student" })
      if (!student) {
        results.push({
          studentId,
          success: false,
          message: "Student not found",
        })
        continue
      }

      // Check if record already exists
      let record = await AttendanceRecord.findOne({
        attendance: attendance._id,
        student: student._id,
      })

      if (record) {
        // Update existing record
        record.status = status
        record.notes = notes !== undefined ? notes : record.notes
        await record.save()
      } else {
        // Create new record
        record = await AttendanceRecord.create({
          attendance: attendance._id,
          student: student._id,
          status,
          notes,
        })
      }

      results.push({
        studentId,
        success: true,
        message: "Record updated successfully",
        recordId: record._id,
      })
    } catch (error) {
      results.push({
        studentId,
        success: false,
        message: error.message,
      })
    }
  }

  res.json({
    message: "Bulk update completed",
    results,
  })
})

// @desc    Get attendance statistics for a student
// @route   GET /api/attendance/student/:studentId
// @access  Private
const getStudentAttendanceStats = asyncHandler(async (req, res) => {
  const { course, semester, year } = req.query

  // Find student
  const student = await User.findOne({ userId: req.params.studentId, role: "student" })
  if (!student) {
    res.status(404)
    throw new Error("Student not found")
  }

  // Check if user is authorized to view these stats
  if (
    student._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin" &&
    req.user.role !== "instructor" &&
    req.user.role !== "dep-head"
  ) {
    res.status(401)
    throw new Error("Not authorized to view these stats")
  }

  // Build filter for attendance sessions
  const attendanceFilter = { status: { $in: ["submitted", "approved"] } }
  if (course) attendanceFilter.course = course
  if (semester) attendanceFilter.semester = semester
  if (year) attendanceFilter.year = year

  // Find all relevant attendance sessions
  const attendanceSessions = await Attendance.find(attendanceFilter)
  const sessionIds = attendanceSessions.map((session) => session._id)

  // Find all records for this student in these sessions
  const records = await AttendanceRecord.find({
    attendance: { $in: sessionIds },
    student: student._id,
  }).populate("attendance", "course date")

  // Calculate statistics
  const totalSessions = sessionIds.length
  const present = records.filter((record) => record.status === "present").length
  const absent = records.filter((record) => record.status === "absent").length
  const late = records.filter((record) => record.status === "late").length
  const excused = records.filter((record) => record.status === "excused").length
  const attendanceRate = totalSessions > 0 ? ((present + late) / totalSessions) * 100 : 0

  // Group records by course
  const courseStats = {}
  records.forEach((record) => {
    const courseName = record.attendance.course
    if (!courseStats[courseName]) {
      courseStats[courseName] = {
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
      }
    }

    courseStats[courseName].total++
    courseStats[courseName][record.status]++
  })

  // Calculate attendance rate for each course
  Object.keys(courseStats).forEach((course) => {
    const stats = courseStats[course]
    stats.attendanceRate = stats.total > 0 ? ((stats.present + stats.late) / stats.total) * 100 : 0
  })

  res.json({
    studentId: student.userId,
    studentName: `${student.firstName} ${student.lastName}`,
    totalSessions,
    present,
    absent,
    late,
    excused,
    attendanceRate,
    courseStats,
    records: records.map((record) => ({
      date: record.attendance.date,
      course: record.attendance.course,
      status: record.status,
      notes: record.notes,
    })),
  })
})

export {
  addAttendanceRecord,
  getAttendanceRecords,
  deleteAttendanceRecord,
  bulkUpdateAttendanceRecords,
  getStudentAttendanceStats,
}

