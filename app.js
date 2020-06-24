const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const routes = require("./routes/routes");
const bodyParser = require("body-parser");
const passport = require("passport");

dotenv.config();

mongoose.connect(
  process.env.DB_CONNECT,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("connected to DB");
  }
);

require("./routes/passportUser")(passport);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

app.use(passport.initialize());
app.use('/uploads', express.static('uploads'));
app.use("/api", routes);

// app.use(passport.session());

module.exports = app;
