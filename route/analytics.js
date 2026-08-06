const express = require("express");
const getInfo = require("../controller/analyticsController");
const auth = require("../middleware/authmiddle");
const router = express.Router();

router.get('/stats',auth.protect, getInfo.getStats);



module.exports = router;