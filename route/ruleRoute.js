const express = require('express');
const router = express.Router();
const ruleController = require('../controller/ruleController');
const apiAuth = require('../middleware/apikeyauth');
const rule = require('../model/rule');

router.route('/rule')
.get(ruleController.getallRules)
.post(apiAuth,ruleController.createRule);

router.route('/rule/:id')
.patch(ruleController.updateRule)
.delete(ruleController.DeleteRule);

module.exports = router;