const express = require('express');
const router = express.Router();
const { sql, query } = require('../config/db');

// GET /api/hotels
router.get('/', async (req, res) => {
  try {
    const { city, stars, minPrice, maxPrice, sort } = req.query;

    let conditions = ['h.is_active = 1'];
    let inputs = [];  // se extiende con spread para evitar push() consecutivos

    if (city) {
      conditions.push('(h.city LIKE @city OR h.neighborhood LIKE @city OR h.address LIKE @city)');
      inputs = [...inputs, { name: 'city', type: sql.NVarChar, value: `%${city}%` }];
    }

    if (stars) {
      const starsArr = stars.split(',').map(s => Number.parseInt(s, 10)).filter(Number.isFinite);
      if (starsArr.length > 0) {
        const starInputs = starsArr.map((s, i) => ({ name: `stars${i}`, type: sql.Int, value: s }));
        const placeholders = starsArr.map((_, i) => `@stars${i}`);
        inputs.push(...starInputs);
        conditions.push(`h.stars IN (${placeholders.join(',')})`);
      }
    }

    if (minPrice) {
      conditions.push('h.price_from >= @minPrice');
      inputs = [...inputs, { name: 'minPrice', type: sql.Decimal, value: Number.parseFloat(minPrice) }];
    }

    if (maxPrice) {
      conditions.push('h.price_from <= @maxPrice');
      inputs = [...inputs, { name: 'maxPrice', type: sql.Decimal, value: Number.parseFloat(maxPrice) }];
    }

    const ORDER_MAP = {
      price_asc:  'h.price_from ASC',
      price_desc: 'h.price_from DESC',
      stars:      'h.stars DESC',
      rating:     'h.rating DESC',
    };
    const orderBy = ORDER_MAP[sort] || 'h.rating DESC';

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
      `SELECT h.id, h.name, h.description, h.address, h.neighborhood, h.city,
              h.stars, h.rating, h.review_count, h.price_from, h.image_url, h.amenities
       FROM Hotels h
       ${whereClause}
       ORDER BY ${orderBy}`,
      inputs
    );

    res.json(result.recordset);
  } catch (err) {
    console.error('Hotels list error:', err.message);
    res.status(500).json({ error: 'Error al obtener hoteles' });
  }
});

// GET /api/hotels/:id
router.get('/:id', async (req, res) => {
  try {
    const hotelId = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(hotelId) || hotelId <= 0) {
      return res.status(400).json({ error: 'ID de hotel inválido' });
    }
    const result = await query(
      `SELECT id, name, description, address, neighborhood, city,
              stars, rating, review_count, price_from, image_url, amenities
       FROM Hotels WHERE id = @id AND is_active = 1`,
      [{ name: 'id', type: sql.Int, value: hotelId }]
    );

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Hotel no encontrado' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Hotel detail error:', err.message);
    res.status(500).json({ error: 'Error al obtener hotel' });
  }
});

module.exports = router;
