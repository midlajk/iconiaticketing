const express = require('express');
const router = express.Router();
const employeeController = require('../controller/employees');
const { requireAuth, requireRole} = require('../middlewares/authentication');

// Route to handle form POST
router.post('/addemployee',requireRole('Admin'),  employeeController.addEmployees);
router.post('/update',requireRole('Admin'), requireAuth, employeeController.updateEmployee);

router.get('/employees',requireRole('Admin'),  employeeController.getEmployees);
router.get('/select-list',requireRole('Admin'),  requireAuth, employeeController.selectname);

module.exports = router;
