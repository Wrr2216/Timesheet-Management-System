var express = require("express");
var router = express.Router();
var middlewares = require("../middlewares.js");
var config = require("../config");
const User = require("./models/user_model.js");
const Timesheet = require("./models/timesheet_model.js");
var bcrypt = require("bcryptjs");

// Renders the dashboard.
router.get(
  "/dashboard",
  middlewares.restrictor,
  async function (req, res, next) {
    if (!req.session.loggedin) {
      res.redirect("/user/login");
    } else {
      const timesheets = await Timesheet.getAllTimesheets();
      res.render("dev");
    }
  }
);

// Get a user for dev purposes.
router.get(
  "/usertest/:id",
  middlewares.restrictor,
  async function (req, res, next) {
    console.log("Params: " + req.params.id);
    var user = await User.findById(parseInt(req.params.id));

    res.sendStatus(200);
    res.end();
  }
);

module.exports = router;
