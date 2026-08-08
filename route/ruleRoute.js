const express = require('express');
const router = express.Router();
const ruleController = require('../controller/ruleController');
const apiAuth = require('../middleware/apikeyauth');
const rule = require('../model/rule');
const {protect} = require("../middleware/authmiddle");

router.route('/rule')
.get(ruleController.getallRules)
.post(protect, apiAuth,ruleController.createRule);

router.route('/rule/:id')
.patch(ruleController.updateRule)
.delete(protect,apiAuth,ruleController.DeleteRule);

module.exports = router;