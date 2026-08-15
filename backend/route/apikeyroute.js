const express = require('express');
const apiController = require('../controller/apiController');
const apiAuth = require('../middleware/apikeyauth');
const {protect} = require("../middleware/authmiddle");

const router = express.Router();

router.route('/register')
.post(protect, apiController.createAPIkey)
.get(protect,apiController.getallAPI);

router.route('/register/:id')
.delete(protect, apiController.deleteAPI);

router.route('/register/:id/reveal')
.get(protect, apiController.revealAPIkey);

router.route('/:id/revoke')
.patch(protect, apiController.revokeAPI);


module.exports = router;