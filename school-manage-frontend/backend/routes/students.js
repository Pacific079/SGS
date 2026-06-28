const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/studentsController');

router.get('/', ctrl.listStudents);
router.get('/export/csv', ctrl.exportCsv);
router.get('/:reg_no', ctrl.getByRegNo);
router.post('/', ctrl.createStudent);

module.exports = router;
