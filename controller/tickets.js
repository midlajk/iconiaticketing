
require('../modal/database')
const mongoose = require('mongoose');
const Ticket = mongoose.model('Ticket')
var path = require('path');
var fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const handlebars = require('handlebars');
const html_to_pdf = require('html-pdf-node');
const moment = require('moment');
const Customer = mongoose.model('Customer')

exports.addticket = async (req, res) => {
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
    
};

// GET: Fetch tickets with DataTables support
exports.getTickets = async (req, res) => {
    
    try {
      // DataTables server-side processing parameters
      const draw = parseInt(req.query.draw) || 1;
      const start = parseInt(req.query.start) || 0;
      const length = parseInt(req.query.length) || 10;
      
      // Get column info for sorting
    //   const orderColumnIndex = req.query.order && req.query.order[0] ? parseInt(req.query.order[0].column) : 6; // Default to date column
    //   const orderColumnName = req.query.columns && req.query.columns[orderColumnIndex] ? req.query.columns[orderColumnIndex].data : 'createdAt';
    //   const orderDir = req.query.order && req.query.order[0] ? req.query.order[0].dir : 'desc';
      
      // Search value
      const searchValue = req.query.search && req.query.search.value ? req.query.search.value : '';
      
      // Build filter object
      const filters = {};
      // Status filter (from tab selection)
      if (req.query.status && req.query.status !== 'All Tickets') {
        filters.status = req.query.status;
      }
      // if(req.session.user.role=='Assistant'){
      //   filters
      // }

        if(req.session.user.role=='Assistant'){
          filters.currentassigned = req.session.user.name;
          }

      
      // Priority filter (from dropdown)
      if (req.query.priorityFilter && req.query.priorityFilter !== '') {
        filters.priority = req.query.priorityFilter;
      }
      
      // Category filter (from dropdown)
      if (req.query.categoryFilter && req.query.categoryFilter !== '') {
        filters.category = req.query.categoryFilter;
      }
      
      // Date filter (from dropdown)
    //   if (req.query.dateFilter && req.query.dateFilter !== '') {
    //     const now = new Date();
    //     let startDate;
        
    //     switch(req.query.dateFilter) {
    //       case 'today':
    //         startDate = new Date(now.setHours(0, 0, 0, 0));
    //         break;
    //       case 'week':
    //         startDate = new Date(now);
    //         startDate.setDate(startDate.getDate() - 7);
    //         break;
    //       case 'month':
    //         startDate = new Date(now);
    //         startDate.setMonth(startDate.getMonth() - 1);
    //         break;
    //       default:
    //         startDate = null;
    //     }
        
    //     if (startDate) {
    //       filters.createdAt = { $gte: startDate };
    //     }
    //   }
      
      // Search filter - search across multiple fields
      if (searchValue) {
        filters.$or = [
          { title: { $regex: searchValue, $options: 'i' } },
          { 'requestor.name': { $regex: searchValue, $options: 'i' } },
          { description: { $regex: searchValue, $options: 'i' } },
          { ticketType: { $regex: searchValue, $options: 'i' } }
        ];
        
        // Try to match ticket ID if search looks like an ID
        // if (searchValue.includes('TKT-')) {
        //   const idPart = searchValue.replace('TKT-', '');
        //   // Add regex for _id that starts with this pattern
        //   filters.$or.push({ _id: { $regex: `^${idPart}`, $options: 'i' } });
        // }
      }
      
      // Get total count (without filters)
      const recordsTotal = await Ticket.countDocuments({});
      
      // Get filtered count
      const recordsFiltered = await Ticket.countDocuments(filters);

      // Create sort object for MongoDB
    //   const sort = {};
    //   sort[orderColumnName] = orderDir === 'asc' ? 1 : -1;
      
      // Get paginated and sorted data
      const tickets = await Ticket.find(filters)
        .sort({_id:-1})
        .skip(start)
        .limit(length);
      // Format response for DataTables
      res.json({
        draw: draw,
        recordsTotal: recordsTotal,
        recordsFiltered: recordsFiltered,
        data: tickets
      });
    } catch (err) {
      console.error('Error fetching tickets:', err);
      res.status(500).json({ 
        error: err.message,
        draw: req.query.draw || 1,
        recordsTotal: 0,
        recordsFiltered: 0,
        data: []
      });
    }
  };
  exports.dhasboardCount = async (req, res) => {
    try {
      // Today's date (start of day)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Base filters
      let pendingFilter = { status: 'Pending' };
      let openFilter = { status: 'Open' };
      let unassignedFilter = {
        $or: [
          { assigned: { $exists: false } }
        ]
      };
      let completedTodayFilter = {
        status: 'Solved',
        'approvals.status': 'Approved',
        'approvals.date': { $gte: today }
      };
      
      // Add additional filter for Assistant role
      if (req.session.user.role == 'Assistant') {
        // Filter to only show tickets where this user is the assigned employee
        const assistantFilter = { currentassigned: req.session.user.name };
        
        // Merge filters
        pendingFilter = { ...pendingFilter, ...assistantFilter };
        openFilter = { ...openFilter, ...assistantFilter };
        completedTodayFilter = { ...completedTodayFilter, ...assistantFilter };
        
        // Note: We don't modify unassignedFilter since it's for tickets with no assignee
      }
      
      // Count tickets by status with appropriate filters
      const pendingCount = await Ticket.countDocuments(pendingFilter);
      const openCount = await Ticket.countDocuments(openFilter);
      const unassignedCount = await Ticket.countDocuments(unassignedFilter);
      const completedTodayCount = await Ticket.countDocuments(completedTodayFilter);
      
      res.json({
        pending: pendingCount,
        open: openCount,
        unassigned: unassignedCount,
        completedToday: completedTodayCount
      });
    } catch (err) {
      console.error('Error fetching ticket counts:', err);
      res.status(500).json({ message: 'Error fetching ticket counts', error: err.message });
    }
  };

  exports.updateticketscreen = async (req, res) => {
    try {
      // Find and update the ticket status
      const ticket = await Ticket.findByIdAndUpdate(
        req.params.id,
        { status: 'Open' },
        { new: true } // This returns the updated ticket
      );
  
      if (!ticket) {
        return res.status(404).send('Ticket not found');
      }
  
      // Render the view
      res.render('viewticket', {
        title: 'Express',
        screen: 'Tickets',
        ticket: ticket
      });
    } catch (err) {
      console.error('Error updating ticket status:', err);
      res.status(500).send('Internal Server Error');
    }
  };
  

const getBase64Image = (filePath) => {
    const image = fs.readFileSync(filePath);
    const ext = path.extname(filePath).slice(1); // 'png'
    return `data:image/${ext};base64,${image.toString('base64')}`;
  };
  exports.downloadform = async (req, res) => {
    const ticket = await Ticket.findById(req.params.id)
    const customer = await Customer.findOne({email:ticket.requestor.email})
    
    let logoPath;
    if (customer && customer.logo) {
      
       logoPath = path.join(__dirname, '..', 'public', 'uploads', customer.logo);
    } else {
       logoPath = path.join(__dirname, '..', 'public', 'images', 'logo.png');
    }
    
    const logoBase64 = getBase64Image(logoPath);
    const ticketObject = ticket.toObject ? ticket.toObject() : {...ticket._doc};

    // Create data object with the logo
    const data = {
      ...ticketObject,
      logo: logoBase64
    };
    
    
    let templatePath = ''
    // Load the Handlebars template
    if (ticket.ticketType === 'BackupRequest') {
      templatePath = path.join(__dirname, 'printables', 'backuprequest.hbs');
    } else if (ticket.ticketType === 'ChangeRequest') {
      templatePath = path.join(__dirname, 'printables', 'changerequest.hbs');
    } else if (ticket.ticketType === 'ChangeManagement') {
      templatePath = path.join(__dirname, 'printables', 'changemanagement.hbs');
    } else if (ticket.ticketType === 'ExitClearance') {
      templatePath = path.join(__dirname, 'printables', 'exitclearance.hbs');
    } else if (ticket.ticketType === 'IncidentReport') {
      templatePath = path.join(__dirname, 'printables', 'incidentreport.hbs');
    } else if (ticket.ticketType === 'DataBreach') {
      templatePath = path.join(__dirname, 'printables', 'databreach.hbs');
    } else if (ticket.ticketType === 'NewUserCreation') {
      templatePath = path.join(__dirname, 'printables', 'newusercreation.hbs');
    } else {
      templatePath = path.join(__dirname, 'printables', 'template.hbs');
    }
    
    const template = fs.readFileSync(templatePath, 'utf8');
    const compiledTemplate = handlebars.compile(template);
    const html = compiledTemplate({ data });
     
    // PDF generation options
    const options = {
        format: 'A4',
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    };
     
    const file = { content: html };
     
    // Define ticketId or use a default one
    const ticketId = req.params.ticketId || '12345';
     
    try {
        const pdfBuffer = await html_to_pdf.generatePdf(file, options);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=backup-request-form-${ticketId}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).send("Something went wrong while generating the PDF.");
    }
 };

exports.viewform = async (req, res) => {

    const ticket = await Ticket.findById(req.params.id)    
    // Create ticket object

    res.render('viewform', { title: 'Express' ,screen : 'Tickets',ticket:ticket });
  
};



exports.updateticketform = async (req, res) => {
    try {
        const { ticketId } = req.body;

        if (!ticketId) {
            return res.status(400).json({ success: false, message: 'Ticket ID is required' });
        }

        // Find the existing ticket
        const ticket = await Ticket.findById(ticketId);

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        // Update basic ticket fields if they exist in the request
        const updateFields = [
            'ticketType', 'title', 'description', 'status', 'priority', 'category'
        ];

        updateFields.forEach(field => {
            if (req.body[field] !== undefined) {
                ticket[field] = req.body[field];
            }
        });

        // Update requestor information if provided
        if (req.body['requestor.name']) ticket.requestor.name = req.body['requestor.name'];
        if (req.body['requestor.customerid']) ticket.requestor.customerid = req.body['requestor.customerid'];
        if (req.body['requestor.email']) ticket.requestor.email = req.body['requestor.email'];

        // Process dynamic form data (data1 through data36)
        for (let i = 1; i <= 36; i++) {
            const fieldName = `formData.data${i}`;
            if (req.body[fieldName] !== undefined) {
                // Initialize formData object if it doesn't exist
                if (!ticket.formData) {
                    ticket.formData = {};
                }
                ticket.formData[`data${i}`] = req.body[fieldName];
            }
        }

        // Handle file attachments if any
        if (req.files && req.files.length > 0) {
            const attachmentPaths = req.files.map(file => file.path || file.filename);
            if (!ticket.attachments) {
                ticket.attachments = attachmentPaths;
            } else {
                ticket.attachments = [...ticket.attachments, ...attachmentPaths];
            }
        }

        // Handle approvals if provided
        if (req.body.approval) {
            const approval = {
                by: req.body['approval.by'] || req.user?.name || 'System',
                status: req.body['approval.status'],
                date: new Date(),
                comments: req.body['approval.comments'] || ''
            };

            if (!ticket.approvals) {
                ticket.approvals = [approval];
            } else {
                ticket.approvals.push(approval);
            }
        }

        // Save the updated ticket
        await ticket.save();

        return res.status(200).json({
            success: true,
            message: 'Ticket updated successfully',
            ticket
        });

    } catch (error) {
        console.error('Error updating ticket:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating ticket',
            error: error.message
        });
    }
};


exports.updateticketstatus = async (req, res) => {
    try {
        const { ticketId, status, priority, assignedTo, comment } = req.body;
        const user = req.session.user.name||'Admin';
        
        // Find the ticket
        const ticket = await Ticket.findById(ticketId);
        
        if (!ticket) {
          return res.status(404).json({ success: false, message: 'Ticket not found' });
        }
        
        // Prepare update data
        const updateData = {};
        let activityTitle = '';
        let activitySolution = '';
        
        // Check what changed and update accordingly
        if (status !== ticket.status) {
          updateData.status = status;
          activityTitle += 'Status Updated';
          activitySolution += `Status changed from ${ticket.status} to ${status}. `;
        }
        
        if (priority !== ticket.priority) {
          updateData.priority = priority;
          activityTitle += activityTitle ? ' & Priority Updated' : 'Priority Updated';
          activitySolution += `Priority changed from ${ticket.priority} to ${priority}. `;
        }
        
        // Handle assignment
        if (assignedTo && (!ticket.assigned || ticket.assigned.length === 0 || 
            ticket.assigned[ticket.assigned.length - 1].employee !== assignedTo)) {
          updateData.currentassigned = assignedTo
          // Add to assigned array
          const assignmentData = {
            date: new Date(),
            employee: assignedTo,
            assignedby: user
          };
          
          updateData.$push = { assigned: assignmentData };
          
          if (!activityTitle) {
            activityTitle = 'Ticket Assigned';
          } else {
            activityTitle += ' & Assigned';
          }
          
          activitySolution += `Assigned to ${assignedTo} by ${user}. `;
        }
        
        // Add user comment if provided
        if (comment) {
          activitySolution += `Comment: "${comment}"`;
        }
        
        // If nothing changed, return error
        if (Object.keys(updateData).length === 0 && !comment) {
          return res.status(400).json({ 
            success: false, 
            message: 'No changes were made to the ticket' 
          });
        }
        
        // Create activity record
        const newActivity = {
          date: new Date(),
          title: activityTitle || 'Ticket Updated',
          solution: activitySolution || `Updated by ${user}`
        };
        
        // Add activity to update data
        if (!updateData.$push) {
          updateData.$push = { activity: newActivity };
        } else {
          updateData.$push.activity = newActivity;
        }
        
        // Update the ticket
        const updatedTicket = await Ticket.findByIdAndUpdate(
          ticketId,
          updateData,
          { new: true }
        );
        
        res.json({ 
          success: true, 
          ticket: updatedTicket,
          activity: newActivity
        });
        
      } catch (error) {
        console.error('Error updating ticket status:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Server error while updating ticket' 
        });
      }
  };
  exports.viewactivity = async (req, res) => {
    try {
      const { ticketId } = req.params;
      
      // Find the ticket and select only the activity and assigned fields
      const ticket = await Ticket.findById(ticketId).select('activity assigned');
      
      if (!ticket) {
        return res.status(404).json({ success: false, message: 'Ticket not found' });
      }
      
      res.json({ 
        success: true, 
        activity: ticket.activity || [],
        assigned: ticket.assigned || []
      });
      
    } catch (error) {
      console.error('Error fetching ticket activity:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching activity log' 
      });
    }
  };
  
  // Route to close ticket
  exports.closeticket = async (req, res) => {

    try {
      const { ticketId } = req.params;
      const { comment } = req.body;
      const user =  'System User';
      
      // Find the ticket
      const ticket = await Ticket.findById(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ success: false, message: 'Ticket not found' });
      }
      
      // Create activity record for closing
      const newActivity = {
        date: new Date(),
        title: 'Ticket Closed',
        solution: `Ticket closed by ${user}${comment ? `. Comment: "${comment}"` : ''}`
      };
      
      // Update the ticket
      const updatedTicket = await Ticket.findByIdAndUpdate(
        ticketId,
        {
          status: 'Closed',
          $push: { activity: newActivity }
        },
        { new: true }
      );
      
      res.json({ 
        success: true, 
        ticket: updatedTicket,
        activity: newActivity
      });
      
    } catch (error) {
      console.error('Error closing ticket:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while closing ticket' 
      });
    }
  };
  