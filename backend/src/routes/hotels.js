const express = require('express');
const router = express.Router();
const { sql, query } = require('../config/db');

// GET /api/hotels
router.get('/', async (req, res) => {
  try {
    const { city, checkin, checkout, guests, stars, minPrice, maxPrice, sort } = req.query;

    let conditions = ['h.is_active = 1'];
    let inputs = [];

    if (city) {
      conditions.push('(h.city LIKE @city OR h.neighborhood LIKE @city OR h.address LIKE @city)');
      inputs.push({ name: 'city', type: sql.NVarChar, value: `%${city}%` });
    }

    if (stars) {
      const starsArr = stars.split(',').map(s => parseInt(s)).filter(s => !isNaN(s));
      if (starsArr.length > 0) {
        const placeholders = starsArr.map((s, i) => {
          inputs.push({ name: `stars${i}`, type: sql.Int, value: s });
          return `@stars${i}`;
        });
        conditions.push(`h.stars IN (${placeholders.join(',')})`);
      }
    }

    if (minPrice) {
      conditions.push('h.price_from >= @minPrice');
      inputs.push({ name: 'minPrice', type: sql.Decimal, value: parseFloat(minPrice) });
    }

    if (maxPrice) {
      conditions.push('h.price_from <= @maxPrice');
      inputs.push({ name: 'maxPrice', type: sql.Decimal, value: parseFloat(maxPrice) });
    }

    let orderBy = 'h.rating DESC';
    if (sort === 'price_asc') orderBy = 'h.price_from ASC';
    else if (sort === 'price_desc') orderBy = 'h.price_from DESC';
    else if (sort === 'stars') orderBy = 'h.stars DESC';
    else if (sort === 'rating') orderBy = 'h.rating DESC';

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
    console.error('Hotels list error:', err);
    res.status(500).json({ error: 'Error al obtener hoteles' });
  }
});

// GET /api/hotels/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, description, address, neighborhood, city,
              stars, rating, review_count, price_from, image_url, amenities
       FROM Hotels WHERE id = @id AND is_active = 1`,
      [{ name: 'id', type: sql.Int, value: parseInt(req.params.id) }]
    );

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Hotel no encontrado' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Hotel detail error:', err);
    res.status(500).json({ error: 'Error al obtener hotel' });
  }
});

module.exports = router;
