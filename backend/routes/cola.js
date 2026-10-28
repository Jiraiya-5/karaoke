import { Router } from 'express'
import jwt from 'jsonwebtoken'
import pool from '../config/database.js'

const router = Router()

// ============================================================
// MIDDLEWARE DE AUTENTICACIÓN
// ============================================================
function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' })
    }
    const decoded = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

// ============================================================
// GET /api/v1/get-queue
// Obtiene la cola del usuario
// ============================================================
router.get('/get-queue', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM v_canciones_completas
       WHERE id IN (
         SELECT cancion_id FROM cola WHERE usuario_id = ?
       )`,
      [req.user.id]
    )
    res.json(rows)
  } catch (err) {
    console.error('❌ /get-queue:', err)
    res.status(500).json({ error: err.message })
  }
})

// ============================================================
// POST /api/v1/add-to-queue
// Añade una canción a la cola
// ============================================================
router.post('/add-to-queue', authMiddleware, async (req, res) => {
  try {
    const { cancionId } = req.body
    if (!cancionId) {
      return res.status(400).json({ error: 'Falta cancionId' })
    }

    // Obtener la posición máxima actual
    const [posRows] = await pool.query(
      'SELECT COALESCE(MAX(position), 0) + 1 AS nextPos FROM cola WHERE usuario_id = ?',
      [req.user.id]
    )
    const position = posRows[0].nextPos

    await pool.query(
      `INSERT INTO cola (usuario_id, cancion_id, position)
       VALUES (?, ?, ?)`,
      [req.user.id, cancionId, position]
    )

    res.json({ success: true, position })
  } catch (err) {
    console.error('❌ /add-to-queue:', err)
    res.status(500).json({ error: err.message })
  }
})

// ============================================================
// DELETE /api/v1/remove-from-queue/:id
// Quita una canción de la cola
// ============================================================
router.delete('/remove-from-queue/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM cola WHERE id = ? AND usuario_id = ?',
      [req.params.id, req.user.id]
    )
    res.json({ success: true })
  } catch (err) {
    console.error('❌ /remove-from-queue:', err)
    res.status(500).json({ error: err.message })
  }
})

// ============================================================
// POST /api/v1/finish-song
// Usado por Player al terminar una canción
// ============================================================
router.post('/finish-song', authMiddleware, async (req, res) => {
  try {
    const { songId, historyId, rate } = req.body
    if (!songId || !historyId) {
      return res.status(400).json({ error: 'Faltan songId o historyId' })
    }

    // Actualizar la puntuación en historial
    await pool.query(
      'UPDATE historial SET rate = ? WHERE id = ? AND usuario_id = ?',
      [rate || 0, historyId, req.user.id]
    )

    // Actualizar rate promedio de la canción
    await pool.query(
      `UPDATE canciones c
       SET c.rate = (
         SELECT COALESCE(AVG(rate), 0) FROM historial WHERE cancion_id = c.id AND rate > 0
       )
       WHERE c.id = ?`,
      [songId]
    )

    res.json({ success: true })
  } catch (err) {
    console.error('❌ /finish-song:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router