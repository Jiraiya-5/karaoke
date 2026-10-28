import { Router } from 'express'
import pool from '../config/database.js'

const router = Router()

// GET /api/v1/get-genres
router.get('/get-genres', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200)
    const offset = parseInt(req.query.offset) || 0
    const q = req.query.q || ''

    let whereClause = 'WHERE g.is_active = 1'
    let params = []
    if (q) {
      whereClause += ' AND LOWER(g.name) LIKE ?'
      params.push(`%${q.toLowerCase()}%`)
    }

    const [rows] = await pool.query(
      `SELECT g.id, g.name, g.image,
              COUNT(c.id) AS song_count
       FROM generos g
       LEFT JOIN canciones c ON c.genre_id = g.id AND c.is_active = 1
       ${whereClause}
       GROUP BY g.id
       ORDER BY g.rate DESC, g.name ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )
    res.json(rows)
  } catch (err) {
    console.error('❌ /get-genres:', err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/v1/generos/:id?limit=50
router.get('/generos/:id', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200)

    const [genreRows] = await pool.query(
      'SELECT * FROM generos WHERE id = ? AND is_active = 1',
      [req.params.id]
    )
    if (!genreRows.length) {
      return res.status(404).json({ error: 'Género no encontrado' })
    }

    const [songs] = await pool.query(
      `SELECT * FROM v_canciones_completas
       WHERE genre_id = ?
       ORDER BY rate DESC
       LIMIT ?`,
      [req.params.id, limit]
    )

    res.json({
      genre: genreRows[0],
      songs
    })
  } catch (err) {
    console.error('❌ /generos/:id:', err)
    res.status(500).json({ error: err.message })
  }
})
export default router