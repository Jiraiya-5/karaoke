import { Router } from 'express'
import pool from '../config/database.js'

const router = Router()

// GET /api/v1/get-effects
router.get('/get-effects', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM efectos WHERE is_active = 1 ORDER BY id ASC'
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router