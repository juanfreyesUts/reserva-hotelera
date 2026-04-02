const express = require('express');
const router = express.Router();
const { sql, query } = require('../config/db');

// GET /api/rooms/hotel/:hotelId?checkin=&checkout=
router.get('/hotel/:hotelId', async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { checkin, checkout } = req.query;

    let queryStr = `
      SELECT r.id, r.hotel_id, r.name, r.type, r.capacity, r.price_per_night,
             r.description, r.image_url, r.is_available
      FROM Rooms r
      WHERE r.hotel_id = @hotelId AND r.is_available = 1
    `;

    const inputs = [{ name: 'hotelId', type: sql.Int, value: parseInt(hotelId) }];

    // Exclude rooms that have confirmed/pending bookings overlapping the dates
    if (checkin && checkout) {
      queryStr += `
        AND r.id NOT IN (
          SELECT b.room_id FROM Bookings b
          WHERE b.hotel_id = @hotelId
            AND b.status IN ('confirmed', 'pending')
            AND b.check_in < @checkout
            AND b.check_out > @checkin
        )
      `;
      inputs.push({ name: 'checkin', type: sql.Date, value: checkin });
      inputs.push({ name: 'checkout', type: sql.Date, value: checkout });
    }

    queryStr += ' ORDER BY r.price_per_night ASC';

    const result = await query(queryStr, inputs);
    res.json(result.recordset);
  } catch (err) {
    console.error('Rooms by hotel error:', err);
    res.status(500).json({ error: 'Error al obtener habitaciones' });
  }
});

// GET /api/rooms/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      `SELECT r.id, r.hotel_id, r.name, r.type, r.capacity, r.price_per_night,
              r.description, r.image_url, r.is_available,
              h.name as hotel_name, h.address, h.city, h.stars, h.rating
       FROM Rooms r
       JOIN Hotels h ON r.hotel_id = h.id
       WHERE r.id = @id`,
      [{ name: 'id', type: sql.Int, value: parseInt(req.params.id) }]
    );

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Habitación no encontrada' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Room detail error:', err);
    res.status(500).json({ error: 'Error al obtener habitación' });
  }
});

module.exports = router;
