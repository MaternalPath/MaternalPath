const express = require('express');
const { Authentication } = require('../middlewares/auth');
const { emergency, savingsProgress } = require('../controller/emergencyWallet');
const router = express.Router()

router.get('/ewallet', Authentication, emergency)

router.get('/monthlysavings', Authentication, savingsProgress)

module.exports = router;