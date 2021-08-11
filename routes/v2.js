const express = require('express');

const router = express.Router();

router.use('/shop', require('./v2/shop.js'));

module.exports = router;
