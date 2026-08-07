const express = require("express");
const getInfo = require("../controller/analyticsController");
const auth = require("../middleware/authmiddle");
const router = express.Router();

router.get('/stats',auth.protect,auth.restrictTo("ADMIN"), getInfo.getStats);



module.exports = router;