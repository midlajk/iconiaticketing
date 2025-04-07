const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const url = `mongodb://127.0.0.1:27017/iconia`;

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", (err) => console.error("MongoDB connection error:", err));
db.once("connected", () => console.log("MongoDB connected successfully"));

const sessions = session({
  secret: "alqatara@123",
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