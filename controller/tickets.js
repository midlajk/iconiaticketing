
require('../modal/database')
const mongoose = require('mongoose');
const Ticket = mongoose.model('Ticket')
var path = require('path');
var fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const handlebars = require('handlebars');
const html_to_pdf = require('html-pdf-node');
const moment = require('moment');

exports.addticket = async (req, res) => {
    try{

console.log(req.body)
    
    
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
        const email = req.body['requestor.email'];

        // Prepare files information
        const attachments = req.files ? req.files.map(file => file.path) : [];

        // Create ticket object
  
        const newTicket = new Ticket({
            ticketType: "Backup", // From hidden field
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
    console.log('here')
    
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
        // .sort(sort)
        .skip(start)
        .limit(length);
      console.log(tickets)
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
        
        // Count tickets by status
        const pendingCount = await Ticket.countDocuments({ status: 'Pending' });
        const openCount = await Ticket.countDocuments({ status: 'Open' });
        
        // Count tickets with no assignee (assuming this is how you track unassigned)
        const unassignedCount = await Ticket.countDocuments({ createdby: { $exists: false } });
        
        // Count tickets completed today
        const completedTodayCount = await Ticket.countDocuments({
          status: 'Solved',
          'approvals.status': 'Approved',
          'approvals.date': { $gte: today }
        });
        
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
    const ticket = await Ticket.findById(req.params.id)
    
   
    // Create ticket object

    res.render('viewticket', { title: 'Express' ,screen : 'Tickets',ticket:ticket });


};

const getBase64Image = (filePath) => {
    const image = fs.readFileSync(filePath);
    const ext = path.extname(filePath).slice(1); // 'png'
    return `data:image/${ext};base64,${image.toString('base64')}`;
  };
exports.downloadform = async (req, res) => {
    const logoPath = path.join(__dirname, '..', 'public', 'images', 'logo.png');
    const logoBase64 = getBase64Image(logoPath);
    
    const data = {
        requestorName: "John Doe",
        department: "Finance",
        location: "HQ",
        contact: "john.doe@example.com",
        requestDate: "2025-04-11",
        fileNames: "Financial Reports Q1 2025",
        logo: logoBase64,
        fileLocation: "../public/images/logo.png",
        startDate: "2025-04-12",
        endDate: "2025-04-12",
        frequency: "Daily",
        retentionPeriod: "1 year",
        backupType: "Full",
        criticality: "High",
        hodStatus: "Approved",
        hodSignature: "",
        hodSignatureDate: "2025-04-11",
        hodComments: "Approved for standard backup protocol",
        itManagerStatus: "Approved",
        itManagerSignature: "",
        itManagerSignatureDate: "2025-04-11",
        backupOperatorSignature: "",
        backupOperatorSignatureDate: ""
    };

    // Load the Handlebars template
    const templatePath = path.join(__dirname, 'template.hbs');
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