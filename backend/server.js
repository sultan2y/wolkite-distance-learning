import express from 'express'
import dotenv from 'dotenv'
import path from 'path'
import connectDB from './config/db.js'
import { notFound, errorHandler } from './middleware/errorMiddleware.js'

// Only import routes that you have created
import userRoutes from './routes/userRoutes.js'

dotenv.config()

connectDB()

const app = express()

app.use(express.json())

// Make uploads folder static
const __dirname = path.resolve()
app.use('/uploads', express.static(path.join(__dirname, '/uploads')))

// Create directories if they don't exist
import fs from 'fs'
const dirs = ['uploads/materials', 'uploads/submissions', 'uploads/receipts']
dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
})

// Only use routes that you have created
app.use('/api/users', userRoutes)

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'API is running...' })
})

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, console.log(`Server running on port ${PORT}`))