const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const url = `mongodb://127.0.0.1:27017/iconia`;

mongoose.connect("mongodb://127.0.0.1:27017/iconia", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB connected successfully!");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
});

require('./database'); 
module.exports = {  mongoose };


