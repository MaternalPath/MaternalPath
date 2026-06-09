const express = require('express');
const { createFirst } = require('../controller/trimester');
const router = express.Router();

router.post('/first', createFirst)

module.exports = router