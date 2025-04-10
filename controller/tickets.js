
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
  