const express = require('express');
const router = express.Router();
const employeeController = require('../controller/employees');
const { requireAuth, requireRole} = require('../middlewares/authentication');

// Route to handle form POST
router.post('/addemployee', employeeController.addEmployees);
router.post('/update',requireAuth, employeeController.updateEmployee);

router.get('/employees', employeeController.getEmployees);
router.get('/select-list',requireAuth, employeeController.selectname);

module.exports = router;
