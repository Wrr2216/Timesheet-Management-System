var express = require("express");
var router = express.Router();
var middlewares = require("../middlewares.js");
var config = require("../config");
const User = require("./models/user_model.js");
const Timesheet = require("./models/timesheet_model.js");
var bcrypt = require("bcryptjs");
var payPeriods = generatePayPeriods();

router.get(
  "/dashboard",
  middlewares.restrictor,
  async function (req, res, next) {
    if (!req.session.loggedin) {
      res.redirect("/user/login");
    } else {
      const timesheets = await Timesheet.getAllTimesheets();
      res.render("admin_dashboard", {
        timesheets: timesheets,
        payPeriods: payPeriods,
      });
    }
  }
);

router.get(
  "/timesheets",
  middlewares.restrictor,
  async function (req, res, next) {
    if (!req.session.loggedin) {
      res.redirect("/user/login");
    } else {
      const timesheets = await Timesheet.getAllTimesheets();
      res.render("admin/timesheets", { timesheets: timesheets });
    }
  }
);

router.get("/users", middlewares.restrictor, async (req, res) => {
  try {
    const users = await User.findAll();
    res.render("admin/users", { users, User });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/users/:id", middlewares.restrictor, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.render("admin/user", { user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/users/:id/edit", middlewares.restrictor, async (req, res) => {
  try {
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/users/edit/", middlewares.restrictor, async (req, res) => {
  /*try {
    const id = req.body.id;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const role = req.body.role;
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const base = req.body.base;

    bcrypt.hash(password, 10, async function (err, hash) {
      await User.updateUser(id, first_name, last_name, role, username, hash, email, base);
    });
    res.redirect('/admin/users');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }*/
});

router.get("/users/:id/delete", middlewares.restrictor, async (req, res) => {
  try {
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get(
  "/users/delete/:id",
  middlewares.restrictor,
  async function (req, res, next) {
    let ownUserId = req.session.userId;
    const isAdmin = await User.isAdministrator(ownUserId);

    if (isAdmin) {
      const userId = req.params.id;
      User.deleteById(userId);
      res.redirect("/admin/users/");
    } else {
      alert("You do not have permission to delete this user.");
      res.redirect("/dashboard");
    }
  }
);

router.post("/users/create", middlewares.restrictor, async (req, res) => {
  try {
    // Sanitize Inputs
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const role = req.body.role;
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const base = req.body.base;

    bcrypt.hash(password, 10, async function (err, hash) {
      await User.createUser(
        first_name,
        last_name,
        role,
        username,
        hash,
        email,
        base
      );
    });
    res.redirect("/admin/users");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/users/view/:id", middlewares.restrictor, async (req, res) => {
  const user = await User.findById(req.params.id);
  const timesheets = await Timesheet.getAllTimesheetsByUserId(req.params.id);
  console.log(timesheets);
  res.render("admin/user", { user, timesheets });
});

function generatePayPeriods() {
  var payPeriods = [];
  var startDate = new Date("December 25, 2022");
  var endDate = new Date("December 31, 2023");

  while (startDate <= endDate) {
    var endPeriod = new Date(startDate.getTime());
    endPeriod.setDate(endPeriod.getDate() + 13);
    payPeriods.push({
      name:
        startDate.toLocaleDateString() + " - " + endPeriod.toLocaleDateString(),
      start: new Date(startDate),
      end: endPeriod,
    });
    startDate.setDate(startDate.getDate() + 14);
  }
  return payPeriods;
}

module.exports = router;
