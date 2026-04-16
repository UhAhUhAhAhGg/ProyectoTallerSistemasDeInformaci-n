const express = require('express');
const router = express.Router();
const { getFilteredPets } = require('../controllers/pets.controller');

router.get('/pets', getFilteredPets);

module.exports = router;