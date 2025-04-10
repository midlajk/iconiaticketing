const express = require('express');
const router = express.Router();
const customerController = require('../controller/tickets');
const upload = require('../middlewares/multipleupload');

// Route to handle form POST
router.post('/newticket', upload, customerController.addticket);
router.get('/tickets', customerController.getTickets);
router.get('/counts', customerController.dhasboardCount);



module.exports = router;
