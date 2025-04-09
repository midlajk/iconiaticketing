
require('../modal/database')
const mongoose = require('mongoose');
const Ticket = mongoose.model('Ticket')
var path = require('path');
var fs = require('fs');
const { v4: uuidv4 } = require('uuid');

exports.addticket = async (req, res) => {
    
        // Generate a unique ID for the ticket
        const ticketId = uuidv4();
        
        // Process form data
        const {
          title,
          description,
          priority = 'Medium',
          ticketType = 'GeneralTicket'
        } = req.body;
        
        // Handle nested requestor data
        const requestorName = req.body['requestor.name'];
        const requestorEmpId = req.body['requestor.empId'];
        
        // Prepare files information
        const attachments = req.files ? req.files.map(file => ({
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype
        })) : [];
        
        // Create ticket object
  
        const newTicket = new Ticket({
            id: ticketId,
            title,
            description,
            priority,
            ticketType,
            requestor: {
              name: requestorName,
              empId: requestorEmpId
            },
            attachments,
            status: 'New',
            createdAt: new Date(),
            updatedAt: new Date()
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
    
};