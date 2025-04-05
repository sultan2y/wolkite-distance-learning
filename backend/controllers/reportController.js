import asyncHandler from "express-async-handler"
import Result from "../models/Result.js"
import Student from "../models/Student.js"

// @desc    Get student results report with filters
// @route   GET /api/reports/student-results
// @access  Private/DepHead
const getStudentResultsReport = asyncHandler(async (req, res) => {
  const { department, semester, year, status } = req.query

  // Build filter object
  const filter = {}
  if (department) filter.department = department
  if (semester) filter.semester = semester
  if (year) filter.year = year
  if (status) filter.status = status

  // Find results with populated references
  const results = await Result.find(filter)
    .populate("student", "firstName lastName userId")
    .populate("course", "courseName")
    .populate("submittedBy", "firstName lastName")
    .populate("approvedBy", "firstName lastName")
    .sort({ student: 1, course: 1 })

  // Format results for response
  const formattedResults = results.map((result) => ({
    studentId: result.student?.userId || "Unknown",
    studentName: result.student ? `${result.student.firstName} ${result.student.lastName}` : "Unknown",
    courseCode: result.courseCode,
    courseName: result.course?.courseName || "Unknown",
    grade: result.grade,
    department: result.department,
    semester: result.semester,
    year: result.year,
    submittedName: result.submittedBy ? `${result.submittedBy.firstName} ${result.submittedBy.lastName}` : "Unknown",
    status: result.status,
    approvedName: result.approvedBy ? `${result.approvedBy.firstName} ${result.approvedBy.lastName}` : "N/A",
    approvalDate: result.approvalDate ? result.approvalDate.toISOString().split("T")[0] : "N/A",
  }))

  res.json(formattedResults)
})

// @desc    Get grade report for a specific student
// @route   GET /api/reports/grade-report
// @access  Private/Admin
const getGradeReport = asyncHandler(async (req, res) => {
  const { studentId, year, semester } = req.query

  // Validate required parameters
  if (!studentId || !year || !semester) {
    res.status(400)
    throw new Error("Student ID, year, and semester are required")
  }

  // Find student
  const student = await Student.findOne({ studentId }).populate("user", "firstName lastName")

  if (!student) {
    res.status(404)
    throw new Error("Student not found")
  }

  // Find results for the student
  const results = await Result.find({
    student: student._id,
    year,
    semester,
  }).populate("course", "courseName")

  if (results.length === 0) {
    res.status(404)
    throw new Error("No results found for this student in the specified year and semester")
  }

  // Calculate CGPA
  let totalCreditHours = 0
  let totalGradePoints = 0

  const courses = results.map((result) => {
    const creditHour = Number.parseFloat(result.creditHour)
    totalCreditHours += creditHour

    // Calculate grade points based on grade
    let gradePoints = 0
    switch (result.grade) {
      case "A+":
        gradePoints = 4.0
        break
      case "A":
        gradePoints = 4.0
        break
      case "A-":
        gradePoints = 3.75
        break
      case "B+":
        gradePoints = 3.5
        break
      case "B":
        gradePoints = 3.0
        break
      case "B-":
        gradePoints = 2.75
        break
      case "C+":
        gradePoints = 2.5
        break
      case "C":
        gradePoints = 2.0
        break
      case "C-":
        gradePoints = 1.5
        break
      case "D":
        gradePoints = 1.0
        break
      default:
        gradePoints = 0.0
    }

    totalGradePoints += creditHour * gradePoints

    return {
      courseName: result.course?.courseName || "Unknown",
      courseCode: result.courseCode,
      year: result.year,
      semester: result.semester,
      creditHour: result.creditHour,
      assignment: result.assignment,
      final: result.final,
      total: result.total,
      grade: result.grade,
    }
  })

  const cgpa = totalCreditHours > 0 ? (totalGradePoints / totalCreditHours).toFixed(2) : "0.00"

  // Format response
  const response = {
    studentId: student.studentId,
    studentName: `${student.firstName} ${student.middleName} ${student.lastName}`,
    year,
    semester,
    courses,
    cgpa,
  }

  res.json(response)
})

export { getStudentResultsReport, getGradeReport }

