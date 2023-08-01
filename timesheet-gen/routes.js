var indexRouter = require("./routes/index");
var timesheetsRouter = require("./routes/timesheets");
var userRouter = require("./routes/user");
var adminRouter = require("./routes/admin");

middlewares = require("./middlewares.js");
/**
 * The main router for the application.
 * @param {Express.Application} app - The express application object.
 * @returns None
 */
module.exports = function (app) {
  app.get("/", indexRouter);
  app.get("/timesheets", middlewares.restrictor, timesheetsRouter);
  app.get("/user", middlewares.restrictor, userRouter);
  app.get("/admin", middlewares.restrictor, adminRouter);
};
