
require('../modal/database')
const mongoose = require('mongoose');
const Employee = mongoose.model('Employee')
var path = require('path');
var fs = require('fs');
const bcrypt = require('bcrypt');

exports.updateEmployee = async (req, res) => {
  try {
    const { id, name, email, role, status, password } = req.body;

    if (!id || !name || !email || !role || !status) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const updateData = {
      name,
      email,
      role,
      status
    };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedEmployee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({ success: true, message: 'Employee updated successfully' });

  } catch (err) {
    console.error('Update error:', err);
    let msg = 'Server error';
    if (err.code === 11000) {
      msg = 'Email already exists';
    }
    res.status(500).json({ success: false, message: msg });
  }
};


exports.addEmployees = async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
  
      if (!name || !email || !password || !role) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newEmployee = new Employee({
        name,
        email,
        password: hashedPassword,
        role
      });
  
      await newEmployee.save();
      res.status(200).json({ success: true });
    } catch (err) {
      console.error('Error adding employee:', err);
      let msg = 'Server error';
      if (err.code === 11000) {
        msg = 'Email already exists';
      }
      res.status(500).json({ success: false, message: msg });
    }
  };
exports.getEmployees = async (req, res) => {
    try {
      const draw = parseInt(req.query.draw);
      const start = parseInt(req.query.start);
      const length = parseInt(req.query.length);
      const searchQuery = req.query.searchQuery || '';
        // Assuming you're using MongoDB with Mongoose
    
        const searchCondition = {
          $or: [
            { name: { $regex: searchQuery, $options: 'i' } },
            { phone: { $regex: searchQuery, $options: 'i' } },
            { address: { $regex: searchQuery, $options: 'i' } }
          ]
        };
    
        const totalRecords = await Employee.countDocuments();
        const filteredRecords = await Employee.countDocuments(searchCondition);
        const data = await Employee.find(searchCondition)
          .skip(start)
          .limit(length)

    
        res.json({
          draw,
          recordsTotal: totalRecords,
          recordsFiltered: filteredRecords,
          data
        });
      } catch (err) {
        console.error('Error fetching customers:', err);
        res.status(500).json({ error: 'Failed to fetch customers' });
      }
}