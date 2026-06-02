const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { sql, query } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' }
});

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    const existing = await query(
      'SELECT id FROM Users WHERE email = @email',
      [{ name: 'email', type: sql.NVarChar, value: email }]
    );
    if (existing.recordset.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const result = await query(
      `INSERT INTO Users (name, email, password_hash, role, phone)
       OUTPUT INSERTED.id, INSERTED.name, INSERTED.email, INSERTED.role
       VALUES (@name, @email, @password_hash, 'user', @phone)`,
      [
        { name: 'name', type: sql.NVarChar, value: name },
        { name: 'email', type: sql.NVarChar, value: email },
        { name: 'password_hash', type: sql.NVarChar, value: password_hash },
        { name: 'phone', type: sql.NVarChar, value: phone || null }
      ]
    );

    const user = result.recordset[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const result = await query(
      'SELECT id, name, email, password_hash, role, phone FROM Users WHERE email = @email',
      [{ name: 'email', type: sql.NVarChar, value: email }]
    );

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = result.recordset[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, email, role, phone, created_at FROM Users WHERE id = @id',
      [{ name: 'id', type: sql.Int, value: req.user.id }]
    );
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Me error:', err.message);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

module.exports = router;
