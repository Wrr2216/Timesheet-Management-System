const mysql = require("mysql2");
const express = require("express");
const MongoStore = require("connect-mongo");
const path = require("path");
const User = require("./models/user_model.js");
const Timesheet = require("./models/timesheet_model.js");
const crypto = require("crypto");
var nodemailer = require("nodemailer");

var router = express.Router();
var middlewares = require("../middlewares.js");
var bcrypt = require("bcryptjs");
var config = require("../config");

// Creates a mysql connection.
let connection;

try {
  connection = mysql.createConnection({
    host: config.sql.host,
    user: config.sql.user,
    password: config.sql.password,
    database: config.sql.database,
  });
} catch (error) {
  console.error("Error connecting to mysql database:", error);
}

// Renders the login page
router.get("/login", function (req, res) {
  res.render("login", { session: req.session });
});

// Renders the register page
router.get("/register", function (req, res, next) {
  res.render("register");
});

// GET restricted area
router.get("/restricted", middlewares.restrictor, function (req, res) {
  res.send(
    'Wahoo! restricted area, click to <a href="/user/logout">logout</a>'
  );
});

// Logout a user.
router.get("/logout", function (req, res) {
  req.session.destroy(function () {
    res.redirect("/");
  });
});

// Authenticates a user.
router.post("/auth", async function (req, res, next) {
  let username = req.body.username;
  let password = req.body.password;

  if (username && password) {
    try {
      const user = await User.findOne({ where: { username } });
      if (user) {
        const match = await bcrypt.compare(password, user.password);
        if (match) {
          req.session.loggedin = true;
          req.session.username = username;
          req.session.first_name = user.first_name;
          req.session.last_name = user.last_name;
          req.session.email = user.email;
          req.session.role = user.role;
          req.session.last_timesheet = user.last_timesheet;
          req.session.base = user.base;
          req.session.userId = user.id;
          //res.redirect("/timesheets/dashboard");
          res.render("dashboard", {
            session: req.session,
            user: [
              req.session.first_name,
              req.session.last_name,
              req.session.role,
              req.session.last_timesheet,
            ],
            isAdmin: User.isAdministrator(req.session.userId),
          });
        } else {
          res.send("Incorrect Password!");
        }
      } else {
        res.send("Incorrect Username!");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.send("Please enter Username and Password!");
    res.end();
  }
});

router.post("/create", function (req, res, next) {
  let username = req.body.username;
  let password = req.body.password;
  let first_name = req.body.first_name;
  let last_name = req.body.last_name;
  let email = req.body.email;
  let role = req.body.role;
  let base = req.body.base;
  if (username && password && first_name && last_name && email && role) {
    bcrypt.hash(password, 10, function (err, hash) {
      User.createUser(first_name, last_name, role, username, hash, email, base)
        .then(() => {
          res.redirect("/user/login");
          res.end();
        })
        .catch((err) => {
          console.log(err);
          res.send("An error occurred while creating your account.");
          res.end();
        });
    });
  } else {
    res.send("Please complete all fields!");
    res.end();
  }
});

router.get("/forgot", async function (req, res, next) {
  res.render("forgot");
});

router.post("/forgot", async function (req, res, next) {
  let email = req.body.email;

  try {
    // Find user by email
    const user = await User.findByEmail(email);
    console.log("Proceeding with password reset for user:");
    // If the user exists, generate a password reset token and send it to the user's email
    if (user) {
      let token = crypto.randomBytes(20).toString("hex");
      let expireDate = new Date();
      expireDate.setHours(expireDate.getHours() + 1); // expire in 1 hour

      console.log("Proceeding with password reset for user 2");
      await User.updateResetPasswordToken(user.id, token, expireDate);
      console.log("Proceeding with password reset for user 3");

      const transporter = nodemailer.createTransport({
        service: config.email.service,
        auth: {
          user: config.email.username,
          pass: config.email.password,
        },
      });

      const mailData = {
        from: config.email.from,
        to: user.email,
        subject: "Password Reset",
        text: `You are receiving this email because you (or someone else) has requested a password reset for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${
          req.protocol
        }://${req.get(
          "host"
        )}/user/reset-password/${token}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
      };

      transporter.sendMail(mailData, (error, info) => {
        if (error) {
          return console.log(error);
        }
        res
          .status(200)
          .send({ message: "Email sent successfully!", data: info });
      });
    } else {
      res.send("Email not found.");
    }
  } catch (error) {
    console.error("Error processing forgot password request:", error);
    res.send("There was an error processing the request.");
  }
});

router.get("/reset-password/:token", async function (req, res, next) {
  let token = req.params.token;

  try {
    const user = await User.findByResetPasswordToken(token);

    if (user) {
      res.render("reset_password", { token: token });
    } else {
      res.send("Password reset token is invalid or has expired.");
    }
  } catch (error) {
    console.error("Error rendering password reset page:", error);
    res.send("There was an error processing the request.");
  }
});

router.post("/reset-password", async function (req, res, next) {
  let token = req.body.token;
  let password = req.body.password;

  try {
    const user = await User.findByResetPasswordToken(token);

    if (user) {
      bcrypt.hash(password, 10, function (err, hash) {
        User.updatePasswordAndResetToken(user.id, hash, null, null);
      });
      res.send("Password reset successfully.");
    } else {
      res.send("Password reset token is invalid or has expired.");
    }
  } catch (error) {
    console.error("Error resetting password:", error);
    res.send("There was an error processing the request.");
  }
});

router.get("/timesheets", async function (req, res, next) {
  const timesheets = await Timesheet.getAllTimesheetsByUserId(req.session.userId);
  res.render("user_timesheets", { timesheets });

});


module.exports = router;
