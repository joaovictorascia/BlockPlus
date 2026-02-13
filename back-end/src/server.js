import express from 'express'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import fileRoutes from './routes/fileRoutes.js'
import authMiddleware from './middleware/authMiddleware.js'

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())

// Routes - APENAS API
app.use('/auth', authRoutes)
app.use('/file', authMiddleware, fileRoutes)

// Health check (opcional, útil para monitoramento)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' })
})

// 404 handler para endpoints que não existem
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
  })
})

// Start server
app.listen(PORT, () => {
    console.log(`API Server running on port: ${PORT}`)
})