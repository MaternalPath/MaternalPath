const express = require('express');
const { createMother } = require('../controller/mother');
const { registerValidator } = require('../middlewares/validator');
const router = express.Router();


router.post('/register',registerValidator, createMother);

module.exports = router