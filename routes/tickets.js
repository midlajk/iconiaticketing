const express = require('express');
const router = express.Router();
const customerController = require('../controller/tickets');
const upload = require('../middlewares/multipleupload');
const { requireAuth, requireRole} = require('../middlewares/authentication');

// Route to handle form POST
router.post('/newticket',requireAuth ,upload, customerController.addticket);
router.get('/tickets',requireAuth, customerController.getTickets);
router.get('/counts',requireAuth, customerController.dhasboardCount);
router.get('/updateticket/:id',requireAuth, customerController.updateticketscreen);
router.get('/downloadform/:id',requireAuth ,customerController.downloadform);
router.get('/viewform/:id',requireAuth, customerController.viewform);
router.post('/updateticketform',requireAuth, customerController.updateticketform);
router.post('/updateticketstatus',requireAuth, customerController.updateticketstatus);

router.get('/:ticketId/activity',requireAuth,customerController.viewactivity);
router.post('/:ticketId/close',requireAuth,customerController.closeticket);


module.exports = router;