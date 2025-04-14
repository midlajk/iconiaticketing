var express = require('express');
var router = express.Router();
const nodemailer = require('nodemailer');
const { requireAuth, requireRole} = require('../middlewares/authentication');

/* GET home page. */
router.get('/login', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/customerticket/:id?', function(req, res, next) {
  const ticketId = req.params.id || 'generalticket';
  res.render('ticketform', { title: 'Express', screen: 'Customer Ticket', ticket: ticketId });
});

router.get('/newticket/:id',requireAuth, function(req, res, next) {
  res.render('newticket', { title: 'Express',screen : 'New Ticket',ticket:req.params.id });
});


router.get('/tickets', requireAuth,function(req, res, next) {
  res.render('tickets', { title: 'Express',screen : 'Tickets' });
});

router.get('/customers',requireAuth, function(req, res, next) {
  res.render('customers', { title: 'Express',screen : 'Customers' });
});
router.get('/newcustomers',requireAuth, function(req, res, next) {
  res.render('newcustomer', { title: 'Express' ,screen : 'Customers'});
});


router.get('/employees', function(req, res, next) {
  res.render('users', { title: 'Express' ,screen : 'Employees' });
});


module.exports = router;
