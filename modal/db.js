const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const url = `mongodb://127.0.0.1:27017/iconia`;

mongoose.connect("mongodb://127.0.0.1:27017/iconia");

mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB connected successfully!");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
});

const sessions = session({
  secret: "icoia@123",
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: url,
    collectionName: "sessions",
  }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 },
});
require('./database'); 
module.exports = { sessions, mongoose };



