const express = require('express');
const router = express.Router();
const apikeyAuth = require('../middleware/apikeyauth');
const { check } = require('../controller/checkController');

router.post('/check', apikeyAuth, check);

module.exports = router;