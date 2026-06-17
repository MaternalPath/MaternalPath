const express = require('express');
const { checkAdmin } = require('../middlewares/auth');
const { checkBill } = require('../controller/billsAndVerification');

const router = express.Router();

router.get('/checkBill', checkAdmin, checkBill)


module.exports = router