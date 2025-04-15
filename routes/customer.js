const express = require('express');
const router = express.Router();
const customerController = require('../controller/customer');
const upload = require('../middlewares/upload');
const { requireAuth, requireRole} = require('../middlewares/authentication');

// Route to handle form POST
router.post('/add',requireAuth,requireRole('Admin'),  upload.single('logo'), customerController.addCustomer);
router.get('/customers',requireAuth,requireRole('Admin'),  customerController.getCustomer);
router.get('/details/:id',requireAuth,requireRole('Admin'),  customerController.customerDetails);
router.get('/edit/:id',requireAuth,requireRole('Admin'), customerController.editcustomer)
router.post('/update/:id',requireAuth,requireRole('Admin'),  upload.single('logo') ,customerController.updatecustomer)
router.get('/getemails',requireAuth, customerController.getemails);
router.get('/getnames',requireAuth, customerController.getnames);


module.exports = router;
