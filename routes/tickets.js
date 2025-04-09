const express = require('express');
const router = express.Router();
const customerController = require('../controller/tickets');
const upload = require('../middlewares/multipleupload');

// Route to handle form POST
router.post('/newticket', upload, customerController.addticket);



module.exports = router;
