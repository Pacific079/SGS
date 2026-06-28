const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/paymentsController');

router.get('/export/csv', ctrl.exportCsv);
router.get('/', ctrl.listPayments);
router.post('/', ctrl.createPayment);

module.exports = router;
