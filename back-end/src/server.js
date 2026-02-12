import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/authRoutes.js'
import fileRoutes from './routes/fileRoutes.js'
import authMiddleware from './middleware/authMiddleware.js'

const app = express()
const PORT = process.env.PORT || 5003

// Para usar __dirname com ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())

// ✅ CAMINHO CORRIGIDO - agora aponta para a pasta public/mock_front_end_use_the_other
app.use(express.static(path.join(__dirname, '../public/frontend')))

// Routes
app.use('/auth', authRoutes)
app.use('/file', authMiddleware, fileRoutes)

// ✅ Rota fallback corrigida
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/frontend/index.html'))
})

// Start server
app.listen(PORT, () => {
    console.log(`Server has started on port: ${PORT}`)
    // Para debug - mostra o caminho correto
    console.log(`Frontend path: ${path.join(__dirname, '../public/frontend')}`)
})