import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import http from 'http'
import { setupSocket } from './socket.js'

import pool from './config/database.js'
import cancionesRouter from './routes/canciones.js'
import artistasRouter from './routes/artistas.js'
import generosRouter from './routes/generos.js'
import usuariosRouter from './routes/usuarios.js'
import colaRouter from './routes/cola.js'
import historialRouter from './routes/historial.js'
import efectosRouter from './routes/efectos.js'
import controlRouter from './routes/control.js'
import publicRouter from './routes/public.js'
import playlistsRouter from './routes/playlists.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const app = express()
const server = http.createServer(app)
const PORT = process.env.API_PORT || 3000

// ===== CORS =====
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://192.168.10.191:5173'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'] // 👈 AÑADIR ESTO
}))

// ===== Logger =====
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`)
  next()
})

// ===== Body parser =====
app.use(express.json({ limit: '10mb' }))

// ===== Ruta de audio =====
app.get('/api/v1/audio/:file', (req, res) => {
  const filePath = path.join(__dirname, 'songs', req.params.file)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  res.setHeader('Accept-Ranges', 'bytes')
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('❌ Error al enviar audio:', err)
      res.status(404).json({ error: 'Archivo no encontrado' })
    }
  })
})

// ===== Health check =====
app.get('/api/v1/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok')
    res.json({ status: 'ok', db: rows[0].ok === 1 })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message })
  }
})

// ===== Rutas =====
app.use('/api/v1', cancionesRouter)
app.use('/api/v1', artistasRouter)
app.use('/api/v1', generosRouter)
app.use('/api/v1', usuariosRouter)
app.use('/api/v1', colaRouter)
app.use('/api/v1', historialRouter)
app.use('/api/v1', efectosRouter)
app.use('/api/v1', controlRouter)
app.use('/api/v1', publicRouter)
app.use('/api/v1', playlistsRouter)

// ===== 404 =====
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` })
})

// ===== Error handler =====
app.use((err, req, res, next) => {
  console.error('❌ Error:', err)
  res.status(500).json({ error: err.message })
})

// ===== Iniciar servidor con Socket.IO =====
const io = setupSocket(server)

server.listen(PORT, () => {
  console.log(`✅ API escuchando en http://localhost:${PORT}`)
  console.log(`   Prueba: http://localhost:${PORT}/api/v1/health`)
})