const express = require('express');
const router = express.Router();
const customerController = require('../controller/customer');
const upload = require('../middlewares/upload');

// Route to handle form POST
router.post('/add', upload.single('logo'), customerController.addCustomer);
router.get('/customers', customerController.getCustomer);
router.get('/details/:id', customerController.customerDetails);
router.get('/edit/:id',customerController.editcustomer)
router.post('/update/:id', upload.single('logo') ,customerController.updatecustomer)


module.exports = router;
