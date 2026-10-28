import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import pool from '../config/database.js'

const router = Router()


// GET /api/v1/get-songs?limit=50&offset=0
router.get('/get-songs', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200)
    const offset = parseInt(req.query.offset) || 0

    // Usar la tabla directa por si la vista falla
    const [rows] = await pool.query(
      `SELECT c.id, c.num, c.title, c.artist_id, c.genre_id,
              c.has_voice, c.is_only_voice, c.rate, c.image, c.lyrics_text,
              a.name AS artist_name, a.image AS artist_image,
              g.name AS genre_name, g.image AS genre_image
       FROM canciones c
       LEFT JOIN artistas a ON c.artist_id = a.id
       LEFT JOIN generos g ON c.genre_id = g.id
       WHERE c.is_active = 1
       ORDER BY c.rate DESC, c.title ASC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    )
    
    // Devolver array vacío si no hay
    res.json(rows || [])
  } catch (err) {
    console.error('❌ /get-songs:', err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/v1/get-recent  → últimas canciones agregadas
router.get('/get-recent', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100)
    const [rows] = await pool.query(
      `SELECT * FROM v_canciones_completas
       ORDER BY (SELECT created_at FROM canciones WHERE id = v_canciones_completas.id) DESC
       LIMIT ?`,
      [limit]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/v1/get-song/:id
router.get('/get-song/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM v_canciones_completas WHERE id = ?',
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Canción no encontrada' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/v1/search?q=...&limit=20&offset=0
router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim()
    if (!q) return res.json([])

    const limit = Math.min(parseInt(req.query.limit) || 20, 100)
    const offset = parseInt(req.query.offset) || 0

    const [rows] = await pool.query(
      `SELECT c.id, c.num, c.title, c.artist_id, c.genre_id,
              c.has_voice, c.is_only_voice, c.rate, c.image,
              a.name AS artist_name, a.image AS artist_image,
              g.name AS genre_name, g.image AS genre_image
       FROM canciones c
       LEFT JOIN artistas a ON c.artist_id = a.id
       LEFT JOIN generos g ON c.genre_id = g.id
       WHERE c.is_active = 1
         AND (
           LOWER(REPLACE(c.title, ' ', '')) LIKE ?
           OR LOWER(REPLACE(a.name, ' ', '')) LIKE ?
           OR LOWER(REPLACE(g.name, ' ', '')) LIKE ?
         )
       ORDER BY c.rate DESC
       LIMIT ? OFFSET ?`,
      [`%${q.toLowerCase().replace(/\s+/g, '')}%`, `%${q.toLowerCase().replace(/\s+/g, '')}%`, `%${q.toLowerCase().replace(/\s+/g, '')}%`, limit, offset]
    )
    res.json(rows || [])
  } catch (err) {
    console.error('❌ /search:', err)
    res.status(500).json({ error: err.message })
  }
})
// ============================================================
// GET /api/v1/song-by-number/:num
// Usado por EkiShortQueue para agregar canción por número
// ============================================================
router.get('/song-by-number/:num', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM v_canciones_completas WHERE num = ? LIMIT 1`,
      [req.params.num]
    )
    if (!rows.length) {
      return res.status(404).json({ error: 'Canción no encontrada' })
    }

    const song = rows[0]

    // Normalizar al formato que espera el frontend
    res.json({
      id: song.id,
      num: song.num,
      title: song.title,
      duration: song.duration,
      hasVoice: !!song.has_voice,
      isOnlyVoice: !!song.is_only_voice,
      lyricsText: song.lyrics_text,
      idVideo: extractYouTubeId(song.video_file),
      art: {
        id: song.artist_id,
        name: song.artist_name,
        img: song.artist_image
      },
      gen: {
        id: song.genre_id,
        name: song.genre_name,
        img: song.genre_image
      }
    })
  } catch (err) {
    console.error('❌ /song-by-number:', err)
    res.status(500).json({ error: err.message })
  }
})

// ============================================================
// GET /api/v1/song-detail/:id
// Usado por Player al reproducir una canción
// ============================================================
// GET /api/v1/song-detail/:id
router.get('/song-detail/:id', async (req, res) => {
  try {
    // Buscar la canción en la vista (que ya trae los JOINs)
    const [rows] = await pool.query(
      `SELECT * FROM v_canciones_completas WHERE id = ? LIMIT 1`,
      [req.params.id]
    )
    
    if (!rows.length) {
      return res.status(404).json({ error: 'Canción no encontrada' })
    }

    const song = rows[0]

    // Generar un JWT temporal para el audio (o null si no usas seguridad)
    const jwt = null 
    
    // Simular un ID de historial (o crearlo en la BD)
    const songHistoryId = Date.now() 

    res.json({
      jwt,
      songHistoryId,
      song: {
        id: song.id,
        num: song.num,
        title: song.title,
        duration: song.duration || 0,
        hasVoice: !!song.has_voice,
        isOnlyVoice: !!song.is_only_voice,
        lyricsText: song.lyrics_text || '',  // 👈 Proteger contra NULL
        idVideo: extractYouTubeId(song.video_file),
        art: {
          id: song.artist_id,
          name: song.artist_name || 'Artista desconocido',
          img: song.artist_image || null
        },
        gen: {
          id: song.genre_id,
          name: song.genre_name || 'Género desconocido',
          img: song.genre_image || null
        }
      }
    })
  } catch (err) {
    console.error('❌ /song-detail:', err)
    res.status(500).json({ error: err.message })
  }
})



// ============================================================
// HELPERS
// ============================================================
function extractYouTubeId(url) {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/.*[?&]v=|youtu\.be\/)([^&?]+)/)
  return match ? match[1] : null
}

function generateAudioToken(userId, songId, songNum) {
  const jwt = require('jsonwebtoken')
  return jwt.sign(
    { userId, songId, songNum, type: 'audio' },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  )
}

async function createHistoryEntry(userId, songId) {
  if (!userId) return null
  try {
    const [result] = await pool.query(
      `INSERT INTO historial (usuario_id, cancion_id, played_at) VALUES (?, ?, NOW())`,
      [userId, songId]
    )
    return result.insertId
  } catch (err) {
    console.error('Error creando historial:', err)
    return null
  }
}
export default router