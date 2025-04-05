import asyncHandler from "express-async-handler"
import Result from "../models/Result.js"
import User from "../models/User.js"

// @desc    Submit grade for a student
// @route   POST /api/grades
// @access  Private/Instructor
const submitGrade = asyncHandler(async (req, res) => {
  const { studentId, courseCode, courseName, year, semester, creditHour, assignment, final } = req.body

  // Calculate total and determine grade
  const total = Number.parseFloat(assignment) + Number.parseFloat(final)
  let grade = ""

  if (total >= 90) {
    grade = "A+"
  } else if (total >= 85) {
    grade = "A"
  } else if (total >= 80) {
    grade = "A-"
  } else if (total >= 75) {
    grade = "B+"
  } else if (total >= 70) {
    grade = "B"
  } else if (total >= 65) {
    grade = "B-"
  } else if (total >= 60) {
    grade = "C+"
  } else if (total >= 50) {
    grade = "C"
  } else if (total >= 45) {
    grade = "C-"
  } else if (total >= 40) {
    grade = "D"
  } else {
    grade = "F"
  }

  // Check if student exists
  const student = await User.findOne({ userId: studentId, role: "student" })
  if (!student) {
    res.status(404)
    throw new Error("Student not found")
  }

  // Create result
  const result = await Result.create({
    studentId,
    courseCode,
    courseName,
    year,
    semester,
    creditHour,
    assignment,
    final,
    total,
    grade,
    status: "Pending",
  })

  if (result) {
    res.status(201).json({ message: "Grade submitted successfully", result })
  } else {
    res.status(400)
    throw new Error("Invalid grade data")
  }
})

// @desc    Approve grade
// @route   PUT /api/grades/:id/approve
// @access  Private/Admin
const approveGrade = asyncHandler(async (req, res) => {
  const result = await Result.findById(req.params.id)

  if (result) {
    result.status = "Approved"
    const updatedResult = await result.save()
    res.json(updatedResult)
  } else {
    res.status(404)
    throw new Error("Result not found")
  }
})

// @desc    Get student grades
// @route   GET /api/grades/student/:id
// @access  Private/Student
const getStudentGrades = asyncHandler(async (req, res) => {
  const studentId = req.params.id || req.user.userId

  const results = await Result.find({ studentId })

  if (results) {
    res.json(results)
  } else {
    res.status(404)
    throw new Error("No grades found for this student")
  }
})

// @desc    Get filtered student grades
// @route   GET /api/grades/filter
// @access  Private/Student
const getFilteredGrades = asyncHandler(async (req, res) => {
  const { courseCode, semester, year } = req.query
  const studentId = req.user.userId

  const filter = { studentId }

  if (courseCode) filter.courseCode = courseCode
  if (semester) filter.semester = semester
  if (year) filter.year = year

  const results = await Result.find(filter)

  res.json(results)
})

// @desc    Generate grade report
// @route   GET /api/grades/report/:id
// @access  Private/Admin
const generateGradeReport = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { year, semester } = req.query

  const student = await User.findOne({ userId: id, role: "student" })

  if (!student) {
    res.status(404)
    throw new Error("Student not found")
  }

  const filter = {
    studentId: id,
    status: "Approved",
  }

  if (year) filter.year = year
  if (semester) filter.semester = semester

  const results = await Result.find(filter)

  // Calculate GPA
  let totalCreditHours = 0
  let totalGradePoints = 0

  results.forEach((result) => {
    const creditHour = result.creditHour
    let gradePoint = 0

    switch (result.grade) {
      case "A+":
        gradePoint = 4.0
        break
      case "A":
        gradePoint = 4.0
        break
      case "A-":
        gradePoint = 3.7
        break
      case "B+":
        gradePoint = 3.3
        break
      case "B":
        gradePoint = 3.0
        break
      case "B-":
        gradePoint = 2.7
        break
      case "C+":
        gradePoint = 2.3
        break
      case "C":
        gradePoint = 2.0
        break
      case "C-":
        gradePoint = 1.7
        break
      case "D":
        gradePoint = 1.0
        break
      case "F":
        gradePoint = 0.0
        break
      default:
        gradePoint = 0.0
    }

    totalCreditHours += creditHour
    totalGradePoints += creditHour * gradePoint
  })

  const gpa = totalCreditHours > 0 ? (totalGradePoints / totalCreditHours).toFixed(2) : 0

  res.json({
    student: {
      id: student._id,
      name: `${student.firstName} ${student.lastName}`,
      studentId: student.userId,
    },
    results,
    gpa,
    totalCreditHours,
  })
})

export { submitGrade, approveGrade, getStudentGrades, getFilteredGrades, generateGradeReport }

