const express = require('express');
const router = express.Router();
const customerController = require('../controller/tickets');
const upload = require('../middlewares/multipleupload');
const { requireAuth, requireRole} = require('../middlewares/authentication');

// Route to handle form POST
router.post('/newticket', upload, customerController.addticket);
router.get('/tickets', customerController.getTickets);
router.get('/counts', customerController.dhasboardCount);
router.get('/updateticket/:id', customerController.updateticketscreen);
router.get('/downloadform/:id', customerController.downloadform);
router.get('/viewform/:id', customerController.viewform);
router.post('/updateticketform', customerController.updateticketform);
router.post('/updateticketstatus', customerController.updateticketstatus);

router.get('/:ticketId/activity',customerController.viewactivity);
router.post('/:ticketId/close',customerController.closeticket);
module.exports = router;