const express = require('express');
const apiController = require('../controller/apiController');
const apiAuth = require('../middleware/apikeyauth');

const router = express.Router();

router.route('/register')
.post(apiController.createAPIkey)
.get(apiController.getallAPI);

router.route('/register/:id')
.delete(apiController.deleteAPI);

router.route('/:id/revoke')
.patch(apiController.revokeAPI);


module.exports = router;