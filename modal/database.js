// Mongoose models for Customer, Recharge, Route, CreditOrderHistory, CustomerAssetHistory, DeletedCustomer, Employee, Order, Salesman, Truck, and TruckHistory

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  emirates: { type: String, required: true },
  area: { type: String },
  city: { type: String },
  state: { type: String },
  po: { type: String }, // P.O.
  email: { type: String, required: true },
  trn: { type: String, required: true }, // T.R.N.
  tradeLicense: { type: String },
  mfid: { type: String }, // M.F.I.D.
  status: { type: String },
  phone: { type: String, required: true },

  contactDetails: {
    managerDirector: { type: String },
    managerContact: { type: String },
    managerEmail: { type: String },
    pocName: { type: String },
    pocContact: { type: String },
    pocEmail: { type: String },
  },

  itService: {
    services: [{ type: String }] // allow multiple services like 'AMC', 'Troubleshooting'
  },
  authentication:{
    otp:String,
    created:String
  },

  createdAt: { type: Date, default: Date.now },
  logo: { type: String }, // Stores filename like '17232091212-logo.png'

});
const employeeSchema = new mongoose.Schema({
  name: {type: String,
  required: true,
  unique: true, // Ensure unique names
  trim: true},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String },
  status: { type: String },
  created: { type: Date, default: Date.now } 
});




const ticketSchema = new mongoose.Schema({
  ticketType: {
    type: String,
   
    required: true,
  },
  createdby:{type:String},
  requestor: {
    name: String,
    customerid: String,
    email:String,

  },
  title: String,
  description: String,
  status: {
    type: String,
    default: 'Pending',
  },
  priority: {
    type: String,
    default: 'Medium',
  },
  category: String, // e.g. emergency/standard, or incident severity
  formData: {
    data1:String,
    data2:String,
    data3:String,
    data4:String,
    data5:String,
    data6:String,
    data7:String,
    data8:String,
    data9:String,
    data10:String,
    data11:String,
    data12:String,
    data13:String,
    data14:String,
    data15:String,
    data16:String,
    data17:String,
    data18:String,
    data19:String,
    data20:String,
    data21:String,
    data22:String,
    data23:String,
    data24:String,
    data25:String,
    data26:String,
    data27:String,
    data28:String,
    data29:String,
    data30:String,
    data31:String,
    data32:String,
    data33:String,
    data34:String,
    data35:String,
    data36:String,


  }, // Stores the entire form-specific data
  createdAt: {
    type: Date,
    default: Date.now,
  },
  assigned:[{
    date:Date,
    employee:String,
    assignedby:String,
    
  }],
  currentassigned:String,
  activity:[{
    date:Date,
    tite:String,
    solution:String,
  }],
  attachments: [String], // For file URLs or names if needed
  approvals: [{
    by: String, // Role or name
    status: String, // Approved/Rejected
    date: Date,
    comments: String
  }]
});

module.exports = mongoose.model('Ticket', ticketSchema);

module.exports = mongoose.model('Customer', customerSchema);
module.exports = mongoose.model('Employee', employeeSchema);


