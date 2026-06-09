const express = require('express');
const { createFirst, createSecond, createThird, getTrimester, createMessage, weeklyMessage } = require('../controller/trimester');
const router = express.Router();

router.post('/first', createFirst);

router.post('/second', createSecond);

router.post('/third', createThird);

router.get('/getTrimester', getTrimester)

router.post('/createMessage', createMessage);

router.get('/weeklyMessage', weeklyMessage)

module.exports = router