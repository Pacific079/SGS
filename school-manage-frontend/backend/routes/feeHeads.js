const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/feeHeadsController');

router.get('/', ctrl.listFeeHeads);

module.exports = router;
