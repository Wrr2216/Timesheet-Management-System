var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var favicon = require("serve-favicon");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const config = require("./config");

var indexRouter = require("./routes/index");
var timesheetsRouter = require("./routes/timesheets");
var userRouter = require("./routes/user");
var adminRouter = require("./routes/admin");
var devRouter = require("./routes/dev");

var app = express();

if (process.env.NODE_ENV === "dev") {
  console.log("Development mode detected!");
}

const options = {
  host: config.sql.host,
  port: 3306,
  user: config.sql.user,
  password: config.sql.password,
  database: config.sql.database,
  clearExpired: true,
  endConnectionOnClose: true,
  connectionLimit: 100,
  maxIdleTime: 900000,
};

const sessionStore = new MySQLStore(options);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

sessionStore
  .onReady()
  .then(() => {
    // MySQL session store ready for use.
    console.log("MySQLStore ready");
  })
  .catch((error) => {
    // Something went wrong.
    console.error(error);
  });

app.use(favicon(path.join(__dirname, "public", "images", "favicon.ico")));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    key: "mkldaw_session", // Change this 
    secret: "d45godmoLKNDlandlwNLDE1FvpRybrBN", // I would change this too
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
  })
);

app.use("/", indexRouter);
app.use("/timesheets", timesheetsRouter);
app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/dev", devRouter);
app.use("/logout", function (req, res) {
  sessionStore
    .close()
    .then(() => {
      // Successfuly closed the MySQL session store.
      console.log("MySQLStore closed");
    })
    .catch((error) => {
      // Something went wrong.
      console.error(error);
    });

  res.sendStatus(200);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
