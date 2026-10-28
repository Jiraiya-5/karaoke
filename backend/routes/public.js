import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import pool from '../config/database.js'

const router = Router()

// ============================================================
// GET /api/v1/public/get-autocomplete
// Devuelve canciones, artistas y géneros para autocompletado
// ============================================================
router.get('/public/get-autocomplete', async (req, res) => {
  try {
    const [songs] = await pool.query(
      `SELECT id, num, title AS name FROM canciones WHERE is_active = 1 LIMIT 500`
    )
    const [artistas] = await pool.query(
      `SELECT id, name FROM artistas WHERE is_active = 1 LIMIT 500`
    )
    const [generos] = await pool.query(
      `SELECT id, name FROM generos WHERE is_active = 1 LIMIT 100`
    )

    res.json(JSON.stringify({ songs, artistas, generos }))
  } catch (err) {
    console.error('❌ /public/get-autocomplete:', err)
    res.status(500).json({ error: err.message })
  }
})

// ============================================================
// GET /api/v1/available-updates
// Devuelve las ofertas activas para el banner
// ============================================================
router.get('/available-updates', async (req, res) => {
  try {
    const [packages] = await pool.query(
      `SELECT
        id,
        name,
        code,
        price,
        message_es,
        message_en,
        purchase_link,
        is_external,
        \`order\`
       FROM available_packages
       WHERE is_active = 1
       ORDER BY \`order\` ASC`
    )

    // Adaptar al formato que espera el frontend
    const formatted = packages.map((p) => ({
      id: p.id,
      name: p.name,
      code: p.code,
      price: p.price,
      purchaseButton: {
        message: {
          es: p.message_es || p.name,
          en: p.message_en || p.name
        },
        link: p.purchase_link,
        external: !!p.is_external
      }
    }))

    res.json({ packages: formatted })
  } catch (err) {
    console.error('❌ /available-updates:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router