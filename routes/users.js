const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Employee = mongoose.model('Employee');
const bcrypt = require('bcrypt');

router.post('/login', async function(req, res, next) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find employee by email
    const employee = await Employee.findOne({ email });
    console.log(employee)
    if (!employee) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is active
    // if (employee.status != 'Active') {
    //   return res.status(403).json({ message: 'Account is not active' });
    // }

    // Store user data in session
    req.session.user = {
      id: employee._id,
      email: employee.email,
      name: employee.name,
      role: employee.role
    };

    // Respond with success
    res.json({ 
      message: 'Login successful',
      user: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.log('Logout error:', err);
      return res.status(500).json({ message: 'Could not log out, please try again' });
    }
    res.clearCookie('connect.sid'); // The default session cookie name
    res.redirect('/login');
  });
});

// Middleware to check authentication
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}

// Middleware to check role
function hasRole(role) {
  return (req, res, next) => {
    if (req.session.user && req.session.user.role === role) {
      return next();
    }
    res.status(403).json({ message: 'Forbidden' });
  };
}

module.exports = {
  router,
  isAuthenticated,
  hasRole
};