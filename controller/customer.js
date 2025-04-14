
require('../modal/database')
const mongoose = require('mongoose');
const Customer = mongoose.model('Customer')
var path = require('path');
var fs = require('fs');

exports.addCustomer = async (req, res) => {
  try {
    const {
      name,
      address,
      emirates,
      area,
      city,
      state,
      po,
      email,
      trn,
      tradeLicense,
      mfid,
      status,
      phone,
      'contactDetails.managerDirector': managerDirector,
      'contactDetails.managerContact': managerContact,
      'contactDetails.managerEmail': managerEmail,
      'contactDetails.pocName': pocName,
      'contactDetails.pocContact': pocContact,
      'contactDetails.pocEmail': pocEmail,
      services
    } = req.body;

    const logo = req.file ? req.file.filename : null;

    const customer = new Customer({
      name,
      address,
      emirates,
      area,
      city,
      state,
      po,
      email,
      trn,
      tradeLicense,
      mfid,
      status,
      phone,
      logo,
      contactDetails: {
        managerDirector,
        managerContact,
        managerEmail,
        pocName,
        pocContact,
        pocEmail
      },
      itService: {
        services: Array.isArray(services) ? services : [services]
      }
    });

    await customer.save();
    res.redirect('/customers');
  } catch (error) {
    console.error('Error saving customer:', error);
    res.status(500).send('Internal Server Error');
  }
};



exports.getCustomer = async (req, res) => {
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
    
        const totalRecords = await Customer.countDocuments();
        const filteredRecords = await Customer.countDocuments(searchCondition);
        const data = await Customer.find(searchCondition)
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


exports.customerDetails = async (req, res) => {
    try {
        const customerId = req.params.id;
        
        // Fetch detailed customer information
        const customer = await Customer.findById(customerId);
        
        if (!customer) {
          return res.status(404).json({ error: 'Customer not found' });
        }
        
        res.json(customer);
      } catch (err) {
        console.error('Error fetching customer details:', err);
        res.status(500).json({ error: 'Failed to fetch customer details' });
      }
    
}


exports.editcustomer = async (req, res) => {

    try {
        const customer = await Customer.findById(req.params.id);
        
        if (!customer) {
          req.flash('error', 'Customer not found');
          return res.redirect('/customers');
        }
        
        res.render('editcustomer', { 
          title: 'Edit Customer',
          screen : 'Customers',
          customer: customer
        });
      } catch (err) {
        console.error('Error fetching customer for edit:', err);
        req.flash('error', 'Error loading customer data');
        res.redirect('/customers');
      }
    
    
}



exports.updatecustomer = async (req, res) => {
    try {
        console.log('sfdf')
      const customerId = req.params.id;
      const customer = await Customer.findById(customerId);
      
      if (!customer) {
        req.flash('error', 'Customer not found');
        return res.redirect('/customers');
      }
      
      // Prepare the update data
      const updateData = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        area: req.body.area,
        city: req.body.city,
        state: req.body.state,
        po: req.body.po,
        trn: req.body.trn,
        emirates: req.body.emirates,
        tradeLicense: req.body.tradeLicense,
        mfid: req.body.mfid,
        status: req.body.status,
        contactDetails: {
          managerDirector: req.body['contactDetails.managerDirector'],
          managerContact: req.body['contactDetails.managerContact'],
          managerEmail: req.body['contactDetails.managerEmail'],
          pocName: req.body['contactDetails.pocName'],
          pocContact: req.body['contactDetails.pocContact'],
          pocEmail: req.body['contactDetails.pocEmail']
        },
        itService: {
          services: Array.isArray(req.body.services) ? req.body.services : [req.body.services].filter(Boolean)
        }
      };
      
      // Handle logo upload
      if (req.file) {
        // Delete old logo if exists
        if (customer.logo) {
          const oldLogoPath = path.join(__dirname, '../public/uploads/', customer.logo);
          if (fs.existsSync(oldLogoPath)) {
            fs.unlinkSync(oldLogoPath);
          }
        }
        updateData.logo = req.file.filename;
      }
      
      // Update the customer
      await Customer.findByIdAndUpdate(customerId, updateData, { new: true });
      
      req.flash('success', 'Customer updated successfully');
      res.redirect('/customers');
    } catch (err) {
      console.error('Error updating customer:', err);
      req.flash('error', 'Error updating customer: ' + err.message);
      res.redirect(`/customers/edit/${req.params.id}`);
    }
  };
  