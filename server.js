import express from 'express'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config()

const app = express()

app.use(express.json())

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'API is running...' })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, console.log(`Server running on port ${PORT}`))