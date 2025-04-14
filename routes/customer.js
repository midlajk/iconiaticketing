const express = require('express');
const router = express.Router();
const customerController = require('../controller/customer');
const upload = require('../middlewares/upload');
const { requireAuth, requireRole} = require('../middlewares/authentication');

// Route to handle form POST
router.post('/add',requireAuth, upload.single('logo'), customerController.addCustomer);
router.get('/customers',requireAuth, customerController.getCustomer);
router.get('/details/:id',requireAuth, customerController.customerDetails);
router.get('/edit/:id',requireAuth,customerController.editcustomer)
router.post('/update/:id',requireAuth, upload.single('logo') ,customerController.updatecustomer)


module.exports = router;
