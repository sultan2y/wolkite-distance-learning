import express from "express"
import dotenv from "dotenv"
import path from "path"
import connectDB from "./config/db.js"
import { notFound, errorHandler } from "./middleware/errorMiddleware.js"

import userRoutes from "./routes/userRoutes.js"
import studentRoutes from "./routes/studentRoutes.js"
import feedbackRoutes from "./routes/feedbackRoutes.js"
import resultRoutes from "./routes/resultRoutes.js"
import moduleRoutes from "./routes/moduleRoutes.js"
import paymentRoutes from "./routes/paymentRoutes.js"
import materialRoutes from "./routes/materialRoutes.js"
import submissionRoutes from "./routes/submissionRoutes.js"
// Add this new route
import attendanceRoutes from "./routes/attendanceRoutes.js"
// Add this line with the other route imports
import registrationRoutes from "./routes/registrationRoutes.js"

dotenv.config()

connectDB()

const app = express()

app.use(express.json())

// Make uploads folder static
const __dirname = path.resolve()
app.use("/uploads", express.static(path.join(__dirname, "/uploads")))

// Create directories if they don't exist
import fs from "fs"
const dirs = ["uploads/materials", "uploads/submissions", "uploads/receipts"]
dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
})

app.use("/api/users", userRoutes)
app.use("/api/students", studentRoutes)
app.use("/api/feedback", feedbackRoutes)
app.use("/api/results", resultRoutes)
app.use("/api/modules", moduleRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/materials", materialRoutes)
app.use("/api/submissions", submissionRoutes)
// Add this new route
app.use("/api/attendance", attendanceRoutes)
// Add this line with the other app.use statements
app.use("/api/registrations", registrationRoutes)
import errorMiddleware from './middleware/errorMiddleware.js';


app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`))

