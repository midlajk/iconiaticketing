const express = require('express');
const router = express.Router();
const customerController = require('../controller/tickets');
const upload = require('../middlewares/multipleupload');

// Route to handle form POST
router.post('/newticket', upload, customerController.addticket);
router.get('/tickets', customerController.getTickets);
router.get('/counts', customerController.dhasboardCount);
router.get('/updateticket/:id', customerController.updateticketscreen);
router.get('/downloadform/:id', customerController.downloadform);
router.get('/viewform/:id', customerController.viewform);


module.exports = router;