const express = require('express');
const router = express.Router();
const { sql, query } = require('../config/db');
const { authenticate } = require('../middleware/auth');

// POST /api/bookings
router.post('/', authenticate, async (req, res) => {
  try {
    const { room_id, hotel_id, check_in, check_out, guests, guest_name, guest_email, guest_phone, special_requests } = req.body;

    if (!room_id || !hotel_id || !check_in || !check_out || !guests || !guest_name || !guest_email) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const checkIn = new Date(check_in);
    const checkOut = new Date(check_out);
    if (checkOut <= checkIn) {
      return res.status(400).json({ error: 'La fecha de salida debe ser posterior a la de entrada' });
    }

    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    // Get room info
    const roomResult = await query(
      'SELECT id, hotel_id, price_per_night, capacity, is_available FROM Rooms WHERE id = @id',
      [{ name: 'id', type: sql.Int, value: parseInt(room_id) }]
    );
    if (roomResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Habitación no encontrada' });
    }

    const room = roomResult.recordset[0];
    if (!room.is_available) {
      return res.status(400).json({ error: 'Habitación no disponible' });
    }

    if (guests > room.capacity) {
      return res.status(400).json({ error: `La habitación tiene capacidad máxima para ${room.capacity} personas` });
    }

    // Check availability
    const conflict = await query(
      `SELECT id FROM Bookings
       WHERE room_id = @room_id
         AND status IN ('confirmed', 'pending')
         AND check_in < @check_out
         AND check_out > @check_in`,
      [
        { name: 'room_id', type: sql.Int, value: parseInt(room_id) },
        { name: 'check_in', type: sql.Date, value: check_in },
        { name: 'check_out', type: sql.Date, value: check_out }
      ]
    );
    if (conflict.recordset.length > 0) {
      return res.status(400).json({ error: 'La habitación no está disponible para las fechas seleccionadas' });
    }

    const total_price = room.price_per_night * nights;

    const result = await query(
      `INSERT INTO Bookings (user_id, room_id, hotel_id, check_in, check_out, guests, total_price,
                             status, guest_name, guest_email, guest_phone, special_requests)
       OUTPUT INSERTED.id, INSERTED.status, INSERTED.total_price, INSERTED.created_at
       VALUES (@user_id, @room_id, @hotel_id, @check_in, @check_out, @guests, @total_price,
               'confirmed', @guest_name, @guest_email, @guest_phone, @special_requests)`,
      [
        { name: 'user_id', type: sql.Int, value: req.user.id },
        { name: 'room_id', type: sql.Int, value: parseInt(room_id) },
        { name: 'hotel_id', type: sql.Int, value: parseInt(hotel_id) },
        { name: 'check_in', type: sql.Date, value: check_in },
        { name: 'check_out', type: sql.Date, value: check_out },
        { name: 'guests', type: sql.Int, value: parseInt(guests) },
        { name: 'total_price', type: sql.Decimal, value: total_price },
        { name: 'guest_name', type: sql.NVarChar, value: guest_name },
        { name: 'guest_email', type: sql.NVarChar, value: guest_email },
        { name: 'guest_phone', type: sql.NVarChar, value: guest_phone || null },
        { name: 'special_requests', type: sql.NVarChar, value: special_requests || null }
      ]
    );

    const booking = result.recordset[0];
    res.status(201).json({
      ...booking,
      nights,
      room_id,
      hotel_id,
      check_in,
      check_out,
      guests,
      guest_name,
      guest_email
    });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ error: 'Error al crear reserva' });
  }
});

// GET /api/bookings/my
router.get('/my', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT b.id, b.check_in, b.check_out, b.guests, b.total_price, b.status,
              b.guest_name, b.guest_email, b.guest_phone, b.special_requests, b.created_at,
              r.name as room_name, r.type as room_type, r.price_per_night,
              h.name as hotel_name, h.address, h.city, h.neighborhood, h.stars, h.image_url
       FROM Bookings b
       JOIN Rooms r ON b.room_id = r.id
       JOIN Hotels h ON b.hotel_id = h.id
       WHERE b.user_id = @user_id
       ORDER BY b.created_at DESC`,
      [{ name: 'user_id', type: sql.Int, value: req.user.id }]
    );
    res.json(result.recordset);
  } catch (err) {
    console.error('My bookings error:', err);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

// PUT /api/bookings/:id/cancel
router.put('/:id/cancel', authenticate, async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);

    const existing = await query(
      'SELECT id, user_id, status FROM Bookings WHERE id = @id',
      [{ name: 'id', type: sql.Int, value: bookingId }]
    );

    if (existing.recordset.length === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    const booking = existing.recordset[0];
    if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'La reserva ya está cancelada' });
    }

    await query(
      "UPDATE Bookings SET status = 'cancelled' WHERE id = @id",
      [{ name: 'id', type: sql.Int, value: bookingId }]
    );

    res.json({ message: 'Reserva cancelada exitosamente' });
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ error: 'Error al cancelar reserva' });
  }
});

module.exports = router;
