var express = require('express');
var router = express.Router();
const nodemailer = require('nodemailer');

/* GET home page. */
router.get('/login', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/customerticket/:id?', function(req, res, next) {
  const ticketId = req.params.id || 'generalticket';
  res.render('ticketform', { title: 'Express', screen: 'Customer Ticket', ticket: ticketId });
});

router.get('/newticket/:id', function(req, res, next) {
  res.render('newticket', { title: 'Express',screen : 'New Ticket',ticket:req.params.id });
});


router.get('/tickets', function(req, res, next) {
  res.render('tickets', { title: 'Express',screen : 'Tickets' });
});

router.get('/customers', function(req, res, next) {
  res.render('customers', { title: 'Express',screen : 'Customers' });
});
router.get('/newcustomers', function(req, res, next) {
  res.render('newcustomer', { title: 'Express' ,screen : 'Customers'});
});


router.get('/employees', function(req, res, next) {
  res.render('users', { title: 'Express' ,screen : 'Employees' });
});


module.exports = router;
