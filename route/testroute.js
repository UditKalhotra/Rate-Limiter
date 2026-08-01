const express = require('express');
const RateLimiter = require('../middleware/rateLimiter');
const apiAuth = require('../middleware/apikeyauth');
const router = express.Router();

router.get("/test",apiAuth,RateLimiter,(req, res) => {
    res.json({
        message: "request reached to SET : "
    });
});

router.post("/test",apiAuth,RateLimiter, (req, res) => {
    res.json({
        message: "Request goes to POST"
    });
});

module.exports = router;