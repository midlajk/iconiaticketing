// In your routes file (e.g., routes/tickets.js)
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();
var path = require('path');
var fs = require('fs');
const { v4: uuidv4 } = require('uuid');
require('../modal/database')
const mongoose = require('mongoose');
const Ticket = mongoose.model('Ticket')
const Customer = mongoose.model('Customer')
const upload = require('../middlewares/multipleupload');

// In-memory store for OTPs (in production, use a database)
const otpStore = new Map();


const transporter = nodemailer.createTransport({
  host:process.env.MTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS 
  }
});

// Send OTP endpoint
router.post('/send-otp', async (req, res) => {
    try {
      const { email } = req.body;
      
   
      const customer = await Customer.findOne({ email: email });
      if (!customer) {
        return res.status(404).json({ 
          success: false, 
          message: 'No account found with this email. Please contact support.' 
        });
      }
  
      // Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
      // Save OTP to customer record
      customer.authentication = {
        otp,
        created: new Date().toISOString()
      };
      await customer.save();
  
      // Send email
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'information@iconia.ae',
        to: email,
        subject: 'Your Verification Code',
        text: `Your verification code is: ${otp}\nThis code will expire in 10 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c7a7b;">Email Verification</h2>
            <p>Please use the following verification code to complete your ticket submission:</p>
            <div style="background: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; font-size: 24px; letter-spacing: 5px;">
              ${otp}
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p style="color: #6c757d; font-size: 12px;">If you didn't request this code, you can safely ignore this email.</p>
          </div>
        `
      };
      
      await transporter.sendMail(mailOptions);
      
      res.json({ 
        success: true, 
        message: 'OTP sent successfully' 
      });
    } catch (error) {
      console.error('Error sending OTP:', error);
      res.json({ 
        success: false, 
        message: 'An error occurred while sending OTP. Please try again later.' 
      });
    }
  });
// Verify OTP endpoint
router.post('/verify-otp', async (req, res) => {
    try {
      const { email, otp } = req.body;
  
      if (!email || !otp) {
        return res.status(400).json({ success: false, message: 'Email and OTP are required' });
      }
  
      const customer = await Customer.findOne({ email });
  
      if (!customer || !customer.authentication || !customer.authentication.otp) {
        return res.status(404).json({ success: false, message: 'No OTP found for this customer' });
      }
  
      const storedOtp = customer.authentication.otp;
      const createdTime = new Date(customer.authentication.created);
      const currentTime = new Date();
      const diffInMinutes = (currentTime - createdTime) / (1000 * 60);
  
      if (otp !== storedOtp) {
        return res.status(401).json({ success: false, message: 'Invalid OTP' });
      }
  
      if (diffInMinutes > 5) {
        return res.status(410).json({ success: false, message: 'OTP has expired' });
      }
  
      // Optional: clear the OTP after successful verification
      customer.authentication.otp = null;
      customer.authentication.created = null;
      await customer.save();
  
      res.json({ success: true, message: 'OTP verified successfully',verified: true  });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      res.status(500).json({ success: false, message: 'Failed to verify OTP' });
    }
  });
  

// Your existing ticket submission route
router.post('/newcostumerticket',upload,async (req, res) => {
    try{
        // Generate a unique ID for the ticket
        const ticketId = uuidv4();
        
 

        // Create ticket object
  
        const newTicket = new Ticket({
            ticketType: req.body.ticketType, // From hidden field
            title: req.body.title,
            description: req.body.description,
            priority: req.body.priority,
            category: req.body.category,
            status: "Pending", // Default status for new tickets
          
            // Requestor information
            requestor: {
              name: req.body["requestor.name"],
              email: req.body["requestor.email"],
              customerid: req.body.requestorEmpId // If you collect this in your form
            },
          
            // All form-specific data mapped to formData
            formData: {
              data1: req.body["formData.data1"], // Location
              data2: req.body["formData.data2"], // Contact
              data3: req.body["formData.data3"], // Department
              data4: req.body["formData.data4"], // Request Date
              data5: req.body["formData.data5"], // File/Folder Names
              data6: req.body["formData.data6"], // File Location
              data7: req.body["formData.data7"], // Start Date
              data8: req.body["formData.data8"], // End Date
              data9: req.body["formData.data9"], // Frequency
              data10: req.body["formData.data10"], // Other Frequency
              data11: req.body["formData.data11"], // Retention Period
              data12: req.body["formData.data12"], // Other Retention
              data13: req.body["formData.data13"], // Backup Type
              data14: req.body["formData.data14"], // Criticality
              data15: req.body["formData.data15"], // HOD Approval
              data16: req.body["formData.data16"], // HOD Signature
              data17: req.body["formData.data17"], // HOD Date
              data18: req.body["formData.data18"], // HOD Comments
              data19: req.body["formData.data19"], // IT Approval
              data20: req.body["formData.data20"], // IT Signature
              data21: req.body["formData.data21"], // IT Date
              data22: req.body["formData.data22"], // Operator Signature
              data23: req.body["formData.data23"], // Operator Date
            },
          
            // Handle approvals
        
          
            // Handle file attachments
            attachments: req.files ? req.files.map(file => file.filename) : [],
            
            // Timestamps
            createdAt: new Date(),
            createdby: req.user ? req.user.email : req.body["requestor.email"] // Use current user or requestor
          });

        // Save ticket to our "database"
        await newTicket.save();
        
        // Log the new ticket (for debugging)
        
        // In a real application, you would save this to a database
        
        // Return success response with ticket ID
        return res.status(201).json({
          success: true,
          message: 'Ticket created successfully',
          ticketId
        });
    }catch (e){
        console.log(e)

    }
});

module.exports = router;