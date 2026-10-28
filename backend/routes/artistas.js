import { Router } from 'express'
import pool from '../config/database.js'

const router = Router()

// GET /api/v1/get-artists
router.get('/get-artists', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200)
    const offset = parseInt(req.query.offset) || 0
    const q = req.query.q || ''

    let whereClause = 'WHERE a.is_active = 1'
    let params = []
    if (q) {
      whereClause += ' AND LOWER(a.name) LIKE ?'
      params.push(`%${q.toLowerCase()}%`)
    }

    const [rows] = await pool.query(
      `SELECT a.id, a.name, a.image,
              COUNT(c.id) AS song_count
       FROM artistas a
       LEFT JOIN canciones c ON c.artist_id = a.id AND c.is_active = 1
       ${whereClause}
       GROUP BY a.id
       ORDER BY a.rate DESC, a.name ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )
    res.json(rows)
  } catch (err) {
    console.error('❌ /get-artists:', err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/v1/artistas/:id?limit=50
router.get('/artistas/:id', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200)

    // Datos del artista
    const [artistRows] = await pool.query(
      'SELECT * FROM artistas WHERE id = ? AND is_active = 1',
      [req.params.id]
    )
    if (!artistRows.length) {
      return res.status(404).json({ error: 'Artista no encontrado' })
    }

    // Canciones del artista
    const [songs] = await pool.query(
      `SELECT * FROM v_canciones_completas
       WHERE artist_id = ?
       ORDER BY rate DESC
       LIMIT ?`,
      [req.params.id, limit]
    )

    res.json({
      artist: artistRows[0],
      songs
    })
  } catch (err) {
    console.error('❌ /artistas/:id:', err)
    res.status(500).json({ error: err.message })
  }
})
export default router