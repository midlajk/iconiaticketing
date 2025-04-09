const express = require('express');
const router = express.Router();
const employeeController = require('../controller/employees');

// Route to handle form POST
router.post('/addemployee', employeeController.addEmployees);
router.post('/update', employeeController.updateEmployee);

router.get('/employees', employeeController.getEmployees);

module.exports = router;
