import mysql from "mysql2/promise"
import mongoose from "mongoose"
import dotenv from "dotenv"
import User from "../models/User.js"
import Student from "../models/Student.js"
import Payment from "../models/Payment.js"
import PaymentAmount from "../models/PaymentAmount.js"
import Course from "../models/Course.js"
import Announcement from "../models/Announcement.js"
import connectDB from "../config/db.js"
import bcrypt from "bcryptjs"

dotenv.config()

// Connect to MongoDB
connectDB()

// MySQL connection configuration
// Replace these with your MySQL database credentials
const mysqlConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "cde",
}

const migrateData = async () => {
  let mysqlConnection

  try {
    console.log("Starting MySQL to MongoDB migration...".yellow)

    // Connect to MySQL
    mysqlConnection = await mysql.createConnection(mysqlConfig)
    console.log("Connected to MySQL database".green)

    // Clear existing MongoDB data
    await User.deleteMany()
    await Student.deleteMany()
    await Payment.deleteMany()
    await PaymentAmount.deleteMany()
    await Course.deleteMany()
    await Announcement.deleteMany()
    console.log("Cleared existing MongoDB data".yellow)

    // Migrate users from 'account' table
    const [users] = await mysqlConnection.execute("SELECT * FROM account")

    // Map MySQL users to MongoDB User model
    const userPromises = users.map(async (user) => {
      // Hash password for security
      const hashedPassword = await bcrypt.hash(user.password, 10)

      // Map role names
      let role = user.accounttype.toLowerCase()
      if (role === "dep-head") role = "dep-head"
      if (role === "coordnator") role = "coordinator"

      return User.create({
        firstName: user.fname,
        lastName: user.lname,
        userId: user.User_Id,
        phone: user.phone,
        username: user.username,
        password: hashedPassword,
        role: role,
        status: user.status,
        isActive: user.isActive === 1,
      })
    })

    const createdUsers = await Promise.all(userPromises)
    console.log(`${createdUsers.length} users migrated`.green)

    // Migrate students
    const [students] = await mysqlConnection.execute("SELECT * FROM student")

    const studentPromises = students.map(async (student) => {
      // Find the corresponding user
      const user = createdUsers.find((u) => u.userId === student.User_Id)

      if (!user) {
        console.log(`No user found for student ${student.stud_id}`.red)
        return null
      }

      return Student.create({
        user: user._id,
        studentId: student.stud_id,
        firstName: student.firstname,
        middleName: student.Middlename,
        lastName: student.lastname,
        birthDate: new Date(student.birthdate),
        sex: student.sex,
        town: student.town,
        woreda: student.woreda,
        address: student.Adress,
        email: student.Email,
        department: student.department,
        phone: student.phone,
        semester: student.simester,
        year: student.year,
      })
    })

    const createdStudents = await Promise.all(studentPromises.filter((p) => p !== null))
    console.log(`${createdStudents.length} students migrated`.green)

    // Migrate payment amounts
    const [paymentAmounts] = await mysqlConnection.execute("SELECT * FROM payment_amounts")

    const paymentAmountPromises = paymentAmounts.map((amount) => {
      return PaymentAmount.create({
        type: amount.type,
        amount: amount.amount,
      })
    })

    const createdPaymentAmounts = await Promise.all(paymentAmountPromises)
    console.log(`${createdPaymentAmounts.length} payment amounts migrated`.green)

    // Migrate courses
    const [courses] = await mysqlConnection.execute("SELECT * FROM curriculem")

    const coursePromises = courses.map((course) => {
      return Course.create({
        courseCode: course.course_code,
        courseName: course.course_name,
        creditHours: course.crdite_houre,
        prerequisite: course.Pre_requst,
        department: course.department,
        semester: course.semister,
        year: course.year,
      })
    })

    const createdCourses = await Promise.all(coursePromises)
    console.log(`${createdCourses.length} courses migrated`.green)

    // Migrate announcements
    const [announcements] = await mysqlConnection.execute("SELECT * FROM announcements")

    // Find an admin user for the announcements
    const adminUser = createdUsers.find((u) => u.role === "admin")

    const announcementPromises = announcements.map((announcement) => {
      return Announcement.create({
        title: announcement.title,
        content: announcement.content,
        createdAt: new Date(announcement.created_at),
        createdBy: adminUser ? adminUser._id : null,
      })
    })

    const createdAnnouncements = await Promise.all(announcementPromises)
    console.log(`${createdAnnouncements.length} announcements migrated`.green)

    console.log("Migration completed successfully!".green.inverse)
  } catch (error) {
    console.error(`Migration failed: ${error}`.red.inverse)
  } finally {
    // Close connections
    if (mysqlConnection) {
      await mysqlConnection.end()
      console.log("MySQL connection closed".yellow)
    }

    await mongoose.disconnect()
    console.log("MongoDB connection closed".yellow)

    process.exit()
  }
}

migrateData()

