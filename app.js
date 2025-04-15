require('./modal/db');
require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { sessions } = require('./modal/db'); // Explicitly import sessions
const flash = require('connect-flash');
var indexRouter = require('./routes/index');
var customerpages = require('./routes/customerrequest');

// var usersRouter = require('./routes/users');
const customerRoutes = require('./routes/customer');
const employeeRoutes = require('./routes/employees');
const ticketRoutes = require('./routes/tickets');
const { router: usersRouter, isAuthenticated, hasRole } = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Session configuration
app.use(sessions);
app.use((req, res, next) => {
  
  if (req.session && req.session.user) {
    res.locals.user = req.session.user;
    //added resptype to true 
  }  else {
    res.locals.user = null; // Ensures `user` is always defined
  }
  next();
});

app.use(flash());

app.use('/', indexRouter);
app.use('/', usersRouter);
app.use('/employee', employeeRoutes);
app.use('/tickets', ticketRoutes);
app.use('/', customerpages);

app.use('/customers', customerRoutes);
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
