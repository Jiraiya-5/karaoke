import { Router } from 'express'
import jwt from 'jsonwebtoken'          // 👈 ESTO FALTABA
import bcrypt from 'bcryptjs'
import pool from '../config/database.js'

const router = Router()

// ============================================================
// MIDDLEWARE DE AUTENTICACIÓN (para /me, /logout, etc.)
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
// GET /api/v1/get-user/:id
// ============================================================
router.get('/get-user/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, uid, email, fullname, display_name, photo_url, phone,
              birthdate, dni, role, is_active, settings, created_at
       FROM usuarios WHERE id = ?`,
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ============================================================
// GET /api/v1/get-user-by-uid/:uid
// ============================================================
router.get('/get-user-by-uid/:uid', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, uid, email, fullname, display_name, photo_url, phone,
              birthdate, dni, role, is_active, settings, created_at
       FROM usuarios WHERE uid = ?`,
      [req.params.uid]
    )
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ============================================================
// GET /api/v1/me
// ============================================================
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, uid, email, fullname, display_name, photo_url, phone,
              birthdate, dni, role, is_active, settings, created_at
       FROM usuarios WHERE id = ?`,
      [req.user.id]
    )
    if (!rows.length) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }
    res.json({ user: rows[0] })
  } catch (err) {
    console.error('❌ Error en /me:', err)
    res.status(500).json({ error: err.message })
  }
})

// ============================================================
// POST /api/v1/register
// ============================================================
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullname } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' })
    }

    const hash = await bcrypt.hash(password, 10)

    const [result] = await pool.query(
      'INSERT INTO usuarios (email, fullname, password_hash, role) VALUES (?, ?, ?, ?)',
      [email, fullname || null, hash, 'user']
    )

    const token = jwt.sign(
      { id: result.insertId, email, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      token,
      user: {
        id: result.insertId,
        email,
        fullname: fullname || null,
        role: 'user'
      }
    })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El email ya está registrado' })
    }
    console.error('❌ Error en /register:', err)
    res.status(500).json({ error: err.message })
  }
})

// ============================================================
// POST /api/v1/login
// ============================================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' })
    }

    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE email = ? AND is_active = 1 LIMIT 1',
      [email]
    )
    if (!rows.length) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const user = rows[0]

    if (user.password_hash) {
      const ok = await bcrypt.compare(password, user.password_hash)
      if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        uid: user.uid,
        email: user.email,
        fullname: user.fullname,
        display_name: user.display_name,
        photo_url: user.photo_url,
        role: user.role
      }
    })
  } catch (err) {
    console.error('❌ Error en /login:', err)
    res.status(500).json({ error: err.message })
  }
})

// ============================================================
// POST /api/v1/logout
// ============================================================
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM refresh_tokens WHERE usuario_id = ?', [req.user.id])
    res.json({ success: true, message: 'Sesión cerrada' })
  } catch (err) {
    console.error('❌ /logout:', err)
    res.status(500).json({ error: err.message })
  }
})

// ============================================================
// POST /api/v1/update-setting
// ============================================================
router.post('/update-setting', authMiddleware, async (req, res) => {
  try {
    const settings = req.body
    await pool.query(
      'UPDATE usuarios SET settings = ? WHERE id = ?',
      [JSON.stringify(settings), req.user.id]
    )
    res.json({ success: true })
  } catch (err) {
    console.error('❌ /update-setting:', err)
    res.status(500).json({ error: err.message })
  }
})

// ============================================================
// POST /api/v1/fcm-token
// ============================================================
router.post('/fcm-token', authMiddleware, async (req, res) => {
  try {
    const { fcmToken } = req.body
    if (!fcmToken) return res.status(400).json({ error: 'Falta fcmToken' })

    await pool.query(
      `INSERT INTO tokens_fcm (usuario_id, fcm_token, platform)
       VALUES (?, ?, 'web')
       ON DUPLICATE KEY UPDATE
         usuario_id = VALUES(usuario_id),
         updated_at = NOW()`,
      [req.user.id, fcmToken]
    )

    res.json({ success: true })
  } catch (err) {
    console.error('❌ /fcm-token:', err)
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/v1/update-profile
router.put('/update-profile', authMiddleware, async (req, res) => {
  try {
    const { fullname, dni, birthdate, phone } = req.body
    await pool.query(
      `UPDATE usuarios SET fullname = ?, dni = ?, birthdate = ?, phone = ? WHERE id = ?`,
      [fullname, dni, birthdate, phone, req.user.id]
    )
    res.json({ success: true })
  } catch (err) {
    console.error('❌ /update-profile:', err)
    res.status(500).json({ error: err.message })
  }
})
// POST /api/v1/subscribe
router.post('/subscribe', authMiddleware, async (req, res) => {
  try {
    const { plan } = req.body // 'basic', 'premium', 'vip'
    
    if (!plan) {
      return res.status(400).json({ error: 'Falta el plan' })
    }

    // Definir duración y límites según el plan
    const plans = {
      basic: { days: 30, songs: 15, connections: 1, price: 10.00 },
      premium: { days: 30, songs: 50, connections: 3, price: 25.00 },
      vip: { days: 30, songs: 9999, connections: 5, price: 50.00 }
    }

    const selectedPlan = plans[plan]
    if (!selectedPlan) {
      return res.status(400).json({ error: 'Plan inválido' })
    }

    // Calcular fechas
    const validFrom = new Date()
    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + selectedPlan.days)

    // Insertar en la tabla `licencias`
    await pool.query(
      `INSERT INTO licencias 
        (usuario_id, package_name, package_code, plan, total_songs, max_allowed_connections, price, valid_from, valid_until, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        req.user.id,
        plan, // package_name (ej: 'vip')
        plan.toUpperCase(), // package_code
        '1', // plan (id del plan)
        selectedPlan.songs,
        selectedPlan.connections,
        selectedPlan.price,
        validFrom.toISOString().split('T')[0], // YYYY-MM-DD
        validUntil.toISOString().split('T')[0]
      ]
    )

    res.json({ success: true, message: 'Suscripción activada' })
  } catch (err) {
    console.error('❌ /subscribe:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router