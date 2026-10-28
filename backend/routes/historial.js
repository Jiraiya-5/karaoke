import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'  // 👈 ESTO FALTA
import pool from '../config/database.js'

const router = Router()
// GET /api/v1/get-history/:usuarioId?limit=50&offset=0
router.get('/get-history/:usuarioId', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200)
    const offset = parseInt(req.query.offset) || 0

    const [rows] = await pool.query(
      'CALL sp_historial_usuario(?, ?, ?)',
      [req.params.usuarioId, limit, offset]
    )
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/v1/add-history
// body: { usuario_id, cancion_id, rate? }
router.post('/add-history', async (req, res) => {
  try {
    const { usuario_id, cancion_id, rate = 0 } = req.body
    if (!usuario_id || !cancion_id) {
      return res.status(400).json({ error: 'usuario_id y cancion_id son obligatorios' })
    }
    const [result] = await pool.query(
      'INSERT INTO historial (usuario_id, cancion_id, rate) VALUES (?, ?, ?)',
      [usuario_id, cancion_id, rate]
    )
    res.status(201).json({ id: result.insertId })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/get-history', authMiddleware, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200)
    const [rows] = await pool.query(
      `CALL sp_historial_usuario(?, ?, 0)`,
      [req.user.id, limit]
    )
    res.json(rows[0])
  } catch (err) {
    console.error('❌ /get-history:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router