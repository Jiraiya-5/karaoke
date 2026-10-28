import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import pool from '../config/database.js'

const router = Router()

// ============================================================
// MIDDLEWARE DE AUTENTICACIÓN
// ============================================================
function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    console.log('🔑 Header recibido:', authHeader) // 👈 AÑADIR LOG
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' })
    }
    const decoded = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    console.error('❌ Error verificando token:', err.message) // 👈 AÑADIR LOG
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

// ============================================================
// GET /api/v1/control/get-access
// ============================================================
router.get('/control/get-access', authMiddleware, async (req, res) => {
  try {
    // Desactivar salas anteriores del usuario
    await pool.query(
      'UPDATE control_rooms SET is_active = 0 WHERE usuario_id = ?',
      [req.user.id]
    )

    // Crear nueva sala
    const roomId = uuidv4()
    const roomCode = Math.floor(100000 + Math.random() * 900000).toString()

    await pool.query(
      `INSERT INTO control_rooms (id, usuario_id, room_code, room_url, is_active, expires_at)
       VALUES (?, ?, ?, ?, 1, DATE_ADD(NOW(), INTERVAL 24 HOUR))`,
      [roomId, req.user.id, roomCode, `/control/${roomCode}`]
    )

    res.json({
      id: roomCode,
      roomId,
      url: `http://192.168.10.191:5173/control/${roomCode}`
    })
  } catch (err) {
    console.error('❌ /control/get-access:', err)
    res.status(500).json({ error: err.message })
  }
})

// ============================================================
// GET /api/v1/control/reset-room
// ============================================================
router.get('/control/reset-room', authMiddleware, async (req, res) => {
  try {
    await pool.query(
      'UPDATE control_rooms SET is_active = 0 WHERE usuario_id = ?',
      [req.user.id]
    )

    const roomId = uuidv4()
    const roomCode = Math.floor(100000 + Math.random() * 900000).toString()

    await pool.query(
      `INSERT INTO control_rooms (id, usuario_id, room_code, room_url, is_active, expires_at)
       VALUES (?, ?, ?, ?, 1, DATE_ADD(NOW(), INTERVAL 24 HOUR))`,
      [roomId, req.user.id, roomCode, `/control/${roomCode}`]
    )

    res.json({
      id: roomCode,       // 👈 ESTO ES LO QUE FALTA
      roomId: roomId,
      url: `${process.env.FRONTEND_URL || 'http://192.168.10.191:5173'}/control/${roomCode}`
    })
  } catch (err) {
    console.error('❌ /control/reset-room:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router