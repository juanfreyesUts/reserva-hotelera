const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Ocultar header X-Powered-By (Security Hotspot: version disclosure)
app.disable('x-powered-by');

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(',');
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/hotels', require('./src/routes/hotels'));
app.use('/api/rooms', require('./src/routes/rooms'));
app.use('/api/bookings', require('./src/routes/bookings'));
app.use('/api/admin', require('./src/routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'StayHub API running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[GlobalError]', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`StayHub API corriendo en http://localhost:${PORT}`);
});
