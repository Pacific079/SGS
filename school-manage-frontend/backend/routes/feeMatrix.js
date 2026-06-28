const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/feeMatrixController');

router.get('/', ctrl.listMatrix);
router.post('/', ctrl.upsertMatrix);

module.exports = router;
