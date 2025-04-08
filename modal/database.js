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

  createdAt: { type: Date, default: Date.now },
  logo: { type: String }, // Stores filename like '17232091212-logo.png'

});

module.exports = mongoose.model('Customer', customerSchema);


