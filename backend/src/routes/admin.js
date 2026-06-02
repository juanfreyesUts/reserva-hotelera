const express = require('express');
const router = express.Router();
const { sql, query } = require('../config/db');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.use(authenticate, authorizeAdmin);

// ============ HOTELS ============

// GET /api/admin/hotels
router.get('/hotels', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, description, address, neighborhood, city, stars, rating,
              review_count, price_from, image_url, amenities, is_active, created_at
       FROM Hotels ORDER BY created_at DESC`
    );
    res.json(result.recordset);
  } catch (err) {
    console.error('Admin hotels error:', err.message);
    res.status(500).json({ error: 'Error al obtener hoteles' });
  }
});

// POST /api/admin/hotels
router.post('/hotels', async (req, res) => {
  try {
    const { name, description, address, neighborhood, city, stars, rating, review_count, price_from, image_url, amenities } = req.body;
    if (!name || !city || !stars || !price_from) {
      return res.status(400).json({ error: 'Nombre, ciudad, estrellas y precio son requeridos' });
    }

    const result = await query(
      `INSERT INTO Hotels (name, description, address, neighborhood, city, stars, rating, review_count, price_from, image_url, amenities, is_active)
       OUTPUT INSERTED.*
       VALUES (@name, @description, @address, @neighborhood, @city, @stars, @rating, @review_count, @price_from, @image_url, @amenities, 1)`,
      [
        { name: 'name', type: sql.NVarChar, value: name },
        { name: 'description', type: sql.NVarChar, value: description || null },
        { name: 'address', type: sql.NVarChar, value: address || null },
        { name: 'neighborhood', type: sql.NVarChar, value: neighborhood || null },
        { name: 'city', type: sql.NVarChar, value: city },
        { name: 'stars', type: sql.Int, value: Number.parseInt(stars, 10) },
        { name: 'rating', type: sql.Decimal, value: Number.parseFloat(rating) || 0 },
        { name: 'review_count', type: sql.Int, value: Number.parseInt(review_count, 10) || 0 },
        { name: 'price_from', type: sql.Decimal, value: Number.parseFloat(price_from) },
        { name: 'image_url', type: sql.NVarChar, value: image_url || null },
        { name: 'amenities', type: sql.NVarChar, value: amenities || null }
      ]
    );
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('Admin create hotel error:', err.message);
    res.status(500).json({ error: 'Error al crear hotel' });
  }
});

// PUT /api/admin/hotels/:id
router.put('/hotels/:id', async (req, res) => {
  try {
    const hotelId = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(hotelId) || hotelId <= 0) return res.status(400).json({ error: 'ID de hotel inválido' });

    const { name, description, address, neighborhood, city, stars, rating, review_count, price_from, image_url, amenities, is_active } = req.body;

    const result = await query(
      `UPDATE Hotels SET
        name = @name, description = @description, address = @address,
        neighborhood = @neighborhood, city = @city, stars = @stars,
        rating = @rating, review_count = @review_count, price_from = @price_from,
        image_url = @image_url, amenities = @amenities, is_active = @is_active
       OUTPUT INSERTED.*
       WHERE id = @id`,
      [
        { name: 'id', type: sql.Int, value: hotelId },
        { name: 'name', type: sql.NVarChar, value: name },
        { name: 'description', type: sql.NVarChar, value: description || null },
        { name: 'address', type: sql.NVarChar, value: address || null },
        { name: 'neighborhood', type: sql.NVarChar, value: neighborhood || null },
        { name: 'city', type: sql.NVarChar, value: city },
        { name: 'stars', type: sql.Int, value: Number.parseInt(stars, 10) },
        { name: 'rating', type: sql.Decimal, value: Number.parseFloat(rating) || 0 },
        { name: 'review_count', type: sql.Int, value: Number.parseInt(review_count, 10) || 0 },
        { name: 'price_from', type: sql.Decimal, value: Number.parseFloat(price_from) },
        { name: 'image_url', type: sql.NVarChar, value: image_url || null },
        { name: 'amenities', type: sql.NVarChar, value: amenities || null },
        { name: 'is_active', type: sql.Bit, value: is_active ?? 1 }
      ]
    );

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Hotel no encontrado' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Admin update hotel error:', err.message);
    res.status(500).json({ error: 'Error al actualizar hotel' });
  }
});

// DELETE /api/admin/hotels/:id
router.delete('/hotels/:id', async (req, res) => {
  try {
    const hotelId = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(hotelId) || hotelId <= 0) return res.status(400).json({ error: 'ID de hotel inválido' });

    const result = await query(
      'UPDATE Hotels SET is_active = 0 OUTPUT INSERTED.id WHERE id = @id',
      [{ name: 'id', type: sql.Int, value: hotelId }]
    );
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Hotel no encontrado' });
    }
    res.json({ message: 'Hotel desactivado exitosamente' });
  } catch (err) {
    console.error('Admin delete hotel error:', err.message);
    res.status(500).json({ error: 'Error al eliminar hotel' });
  }
});

// ============ ROOMS ============

// GET /api/admin/rooms
router.get('/rooms', async (req, res) => {
  try {
    const result = await query(
      `SELECT r.id, r.hotel_id, r.name, r.type, r.capacity, r.price_per_night,
              r.description, r.image_url, r.is_available, h.name as hotel_name
       FROM Rooms r
       JOIN Hotels h ON r.hotel_id = h.id
       ORDER BY h.name, r.price_per_night`
    );
    res.json(result.recordset);
  } catch (err) {
    console.error('Admin rooms error:', err.message);
    res.status(500).json({ error: 'Error al obtener habitaciones' });
  }
});

// POST /api/admin/rooms
router.post('/rooms', async (req, res) => {
  try {
    const { hotel_id, name, type, capacity, price_per_night, description, image_url } = req.body;
    if (!hotel_id || !name || !type || !capacity || !price_per_night) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const result = await query(
      `INSERT INTO Rooms (hotel_id, name, type, capacity, price_per_night, description, image_url, is_available)
       OUTPUT INSERTED.*
       VALUES (@hotel_id, @name, @type, @capacity, @price_per_night, @description, @image_url, 1)`,
      [
        { name: 'hotel_id', type: sql.Int, value: Number.parseInt(hotel_id, 10) },
        { name: 'name', type: sql.NVarChar, value: name },
        { name: 'type', type: sql.NVarChar, value: type },
        { name: 'capacity', type: sql.Int, value: Number.parseInt(capacity, 10) },
        { name: 'price_per_night', type: sql.Decimal, value: Number.parseFloat(price_per_night) },
        { name: 'description', type: sql.NVarChar, value: description || null },
        { name: 'image_url', type: sql.NVarChar, value: image_url || null }
      ]
    );
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('Admin create room error:', err.message);
    res.status(500).json({ error: 'Error al crear habitación' });
  }
});

// PUT /api/admin/rooms/:id
router.put('/rooms/:id', async (req, res) => {
  try {
    const roomId = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(roomId) || roomId <= 0) return res.status(400).json({ error: 'ID de habitación inválido' });

    const { hotel_id, name, type, capacity, price_per_night, description, image_url, is_available } = req.body;

    const result = await query(
      `UPDATE Rooms SET
        hotel_id = @hotel_id, name = @name, type = @type, capacity = @capacity,
        price_per_night = @price_per_night, description = @description,
        image_url = @image_url, is_available = @is_available
       OUTPUT INSERTED.*
       WHERE id = @id`,
      [
        { name: 'id', type: sql.Int, value: roomId },
        { name: 'hotel_id', type: sql.Int, value: Number.parseInt(hotel_id, 10) },
        { name: 'name', type: sql.NVarChar, value: name },
        { name: 'type', type: sql.NVarChar, value: type },
        { name: 'capacity', type: sql.Int, value: Number.parseInt(capacity, 10) },
        { name: 'price_per_night', type: sql.Decimal, value: Number.parseFloat(price_per_night) },
        { name: 'description', type: sql.NVarChar, value: description || null },
        { name: 'image_url', type: sql.NVarChar, value: image_url || null },
        { name: 'is_available', type: sql.Bit, value: is_available !== undefined ? is_available : 1 }
      ]
    );

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Habitación no encontrada' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Admin update room error:', err.message);
    res.status(500).json({ error: 'Error al actualizar habitación' });
  }
});

// DELETE /api/admin/rooms/:id
router.delete('/rooms/:id', async (req, res) => {
  try {
    const roomId = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(roomId) || roomId <= 0) return res.status(400).json({ error: 'ID de habitación inválido' });

    const result = await query(
      'UPDATE Rooms SET is_available = 0 OUTPUT INSERTED.id WHERE id = @id',
      [{ name: 'id', type: sql.Int, value: roomId }]
    );
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Habitación no encontrada' });
    }
    res.json({ message: 'Habitación desactivada exitosamente' });
  } catch (err) {
    console.error('Admin delete room error:', err.message);
    res.status(500).json({ error: 'Error al eliminar habitación' });
  }
});

// ============ BOOKINGS ============

// GET /api/admin/bookings
router.get('/bookings', async (req, res) => {
  try {
    const result = await query(
      `SELECT b.id, b.check_in, b.check_out, b.guests, b.total_price, b.status,
              b.guest_name, b.guest_email, b.guest_phone, b.special_requests, b.created_at,
              u.name as user_name, u.email as user_email,
              r.name as room_name, r.type as room_type,
              h.name as hotel_name, h.city
       FROM Bookings b
       JOIN Users u ON b.user_id = u.id
       JOIN Rooms r ON b.room_id = r.id
       JOIN Hotels h ON b.hotel_id = h.id
       ORDER BY b.created_at DESC`
    );
    res.json(result.recordset);
  } catch (err) {
    console.error('Admin bookings error:', err.message);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

// PUT /api/admin/bookings/:id/status
router.put('/bookings/:id/status', async (req, res) => {
  try {
    const bookingId = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(bookingId) || bookingId <= 0) return res.status(400).json({ error: 'ID de reserva inválido' });

    const { status } = req.body;
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const result = await query(
      "UPDATE Bookings SET status = @status OUTPUT INSERTED.id, INSERTED.status WHERE id = @id",
      [
        { name: 'id', type: sql.Int, value: bookingId },
        { name: 'status', type: sql.NVarChar, value: status }
      ]
    );

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Admin update booking status error:', err.message);
    res.status(500).json({ error: 'Error al actualizar estado de reserva' });
  }
});

module.exports = router;
