const express = require('express');
const router = express.Router();

router.get('/refugios', (req, res) => {
  res.json([
    { id: 1, nombre: 'Refugio Los Amigos' },
    { id: 2, nombre: 'Patitas Felices' },
    { id: 3, nombre: 'Huellitas La Paz' },
  ]);
});

module.exports = router;