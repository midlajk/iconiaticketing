// Mongoose models for Customer, Recharge, Route, CreditOrderHistory, CustomerAssetHistory, DeletedCustomer, Employee, Order, Salesman, Truck, and TruckHistory

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String },
  createdAt: { type: Date, default: Date.now },
  mobileNumber: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
  address: { type: String },
  contractDate: { type: Date },
  createdByEmployee: { type: String },
  representativeId: { type: String },
  // routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  email: { type: String },

});

module.exports = {
    Customer: mongoose.model('Customer', customerSchema),
    

  };