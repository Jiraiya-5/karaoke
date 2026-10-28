import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { authMiddleware } from '../middleware/auth.js'
import pool from '../config/database.js'

const router = Router()

router.get('/get-playlists', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM playlist WHERE usuario_id = ? AND is_active = 1',
      [req.user.id]
    )
    res.json(rows.map(p => ({ ...p, songs: p.songs ? JSON.parse(p.songs) : [] })))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/create-playlist', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body
    const id = uuidv4()
    await pool.query(
      'INSERT INTO playlist (id, usuario_id, name, songs) VALUES (?, ?, ?, ?)',
      [id, req.user.id, name, JSON.stringify([])]
    )
    res.status(201).json({ id, name })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/delete-playlist/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query(
      'UPDATE playlist SET is_active = 0 WHERE id = ? AND usuario_id = ?',
      [req.params.id, req.user.id]
    )
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router