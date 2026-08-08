const express = require("express");
const getInfo = require("../controller/analyticsController");
const auth = require("../middleware/authmiddle");
const router = express.Router();

router.get('/stats',auth.protect,auth.restrictTo("ADMIN"), getInfo.getStats);
router.get('/used',getInfo.getMostUsedAPI);
router.get("/abuse",getInfo.getAbusivekeys);
router.get("/overT",getInfo.getRequestsOverTime);



module.exports = router;