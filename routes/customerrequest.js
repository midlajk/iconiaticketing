// In your routes file (e.g., routes/tickets.js)
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

require('../modal/database')
const mongoose = require('mongoose');
const Ticket = mongoose.model('Ticket')
const Customer = mongoose.model('Customer')

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
    console.log(process.env.MTP_HOST)
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const requestId = crypto.randomBytes(16).toString('hex');
    const expiresAt = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
    
    // Store OTP
    otpStore.set(requestId, { email, otp, expiresAt, attempts: 0 });
    
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
    
    res.json({ success: true, requestId });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

// Verify OTP endpoint
router.post('/verify-otp', (req, res) => {
  try {
    const { requestId, otp } = req.body;
    console.log(req.body)
    
    if (!otp) {
      return res.status(400).json({ success: false, message: 'Request ID and OTP are required' });
    }
    
    const otpData = otpStore.get(requestId);
    
    // if (!otpData) {
    //   return res.status(400).json({ success: false, message: 'Invalid or expired OTP request' });
    // }
    
    // // Check if OTP has expired
    // if (Date.now() > otpData.expiresAt) {
    //   otpStore.delete(requestId);
    //   return res.status(400).json({ success: false, message: 'OTP has expired' });
    // }
    
    // // Check attempts
    // if (otpData.attempts >= 3) {
    //   otpStore.delete(requestId);
    //   return res.status(400).json({ success: false, message: 'Too many attempts. Please request a new OTP.' });
    // }
    
    // // Verify OTP
    // if (otpData.otp !== otp) {
    //   otpData.attempts++;
    //   otpStore.set(requestId, otpData);
    //   return res.status(400).json({ success: false, message: 'Invalid OTP' });
    // }
    
    // // OTP is valid - remove from store and return success
    otpStore.delete(requestId);
    res.json({ verified: true });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to verify OTP' });
  }
});

// Your existing ticket submission route
router.post('/newuserticket',async (req, res) => {
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