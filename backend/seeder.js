import dotenv from "dotenv"
import User from "./models/User.js"
import Student from "./models/Student.js"
import Payment from "./models/Payment.js"
import PaymentAmount from "./models/PaymentAmount.js"
import Course from "./models/Course.js"
import Announcement from "./models/Announcement.js"
import connectDB from "./config/db.js"
import bcrypt from "bcryptjs"
const errorHandler = require('./middleware/errorMiddleware');


dotenv.config()

// Connect to MongoDB
connectDB()

// Sample data for initial setup
const paymentAmounts = [
  {
    type: "semester",
    amount: 5000,
  },
  {
    type: "year",
    amount: 9000,
  },
]

const announcements = [
  {
    title: "Welcome",
    content: "Welcome to the new semester!",
    createdAt: new Date("2023-10-05"),
  },
  {
    title: "Maintenance",
    content: "System maintenance scheduled for next week.",
    createdAt: new Date("2023-10-05"),
  },
]

// Import data
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany()
    await Student.deleteMany()
    await Payment.deleteMany()
    await PaymentAmount.deleteMany()
    await Course.deleteMany()
    await Announcement.deleteMany()

    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 10)
    const admin = await User.create({
      firstName: "Admin",
      lastName: "User",
      userId: "BDU0700857UR",
      phone: "+251918600679",
      username: "admin",
      password: adminPassword,
      role: "admin",
      status: 1,
      isActive: true,
    })

    // Create student user
    const studentPassword = await bcrypt.hash("student123", 10)
    const student = await User.create({
      firstName: "Tehaye",
      lastName: "Marie",
      userId: "100",
      phone: "+25191823423452",
      username: "Tehaye",
      password: studentPassword,
      role: "student",
      status: 6,
      isActive: true,
    })

    // Create coordinator user
    const coordinatorPassword = await bcrypt.hash("abcd", 10)
    const coordinator = await User.create({
      firstName: "Himanot",
      lastName: "Abere",
      userId: "Coordnatior",
      phone: "0929765432",
      username: "abcd",
      password: coordinatorPassword,
      role: "coordinator",
      status: 3,
      isActive: true,
    })

    // Create student profile
    await Student.create({
      user: student._id,
      studentId: "100",
      firstName: "Tehaye",
      middleName: "Marie",
      lastName: "Demeke",
      birthDate: new Date("1963-02-02"),
      sex: "male",
      town: "Metema",
      woreda: "Bahir dar",
      address: "Bahir dar",
      email: "A@yahoo.com",
      department: "Markating Managment",
      phone: "+25191823423452",
      semester: "1",
      year: "1",
    })

    // Create payment amounts
    await PaymentAmount.insertMany(paymentAmounts)

    // Create announcements
    const createdAnnouncements = await Announcement.insertMany(
      announcements.map((announcement) => ({
        ...announcement,
        createdBy: admin._id,
      })),
    )

    console.log("Data Imported!".green.inverse)
    process.exit()
  } catch (error) {
    console.error(`${error}`.red.inverse)
    process.exit(1)
  }
}

// Destroy data
const destroyData = async () => {
  try {
    // Clear existing data
    await User.deleteMany()
    await Student.deleteMany()
    await Payment.deleteMany()
    await PaymentAmount.deleteMany()
    await Course.deleteMany()
    await Announcement.deleteMany()

    console.log("Data Destroyed!".red.inverse)
    process.exit()
  } catch (error) {
    console.error(`${error}`.red.inverse)
    process.exit(1)
  }
}

// Check command line argument to determine action
if (process.argv[2] === "-d") {
  destroyData()
} else {
  importData()
}

