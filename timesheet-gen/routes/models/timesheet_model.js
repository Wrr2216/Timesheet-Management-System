var config = require("../../config");
const User = require("./user_model.js");

const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize(
  config.sql.database,
  config.sql.user,
  config.sql.password,
  {
    host: config.sql.host,
    dialect: "mysql",
  }
);

const Timesheet = sequelize.define(
  "timesheet",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    week_1: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    week_2: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    timesheet_data: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    flatRateItems: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    explanationItems: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    submitted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    tableName: "timesheets",
  }
);

// Find a timesheet by id.
Timesheet.findById = async function (id) {
  try {
    const timesheet = await Timesheet.findOne({
      where: { id },
    });

    return timesheet;
  } catch (error) {
    console.error("Error finding timesheet by id:", error);
  }
};

// Finds a timesheet by username.
Timesheet.findByUsername = async function (username) {
  try {
    const timesheet = await Timesheet.findOne({
      where: { username },
    });

    return timesheet;
  } catch (error) {
    console.error("Error finding timesheet by username:", error);
  }
};

// Creates a new timesheet.
Timesheet.createTimesheet = async function (
  user_id,
  week_1,
  week_2,
  timesheet_data,
  flatRateItems,
  explanationItems,
  submitted
) {
  try {
    const timesheet = await Timesheet.create({
      user_id,
      week_1,
      week_2,
      timesheet_data,
      flatRateItems,
      explanationItems,
      submitted
    });

    // Update the user's last_timesheet field
    User.updateLastTimesheet(user_id, timesheet.id);
  } catch (error) {
    console.error("Error creating timesheet:", error);
  }
};

// Updates a timesheet.
// Timesheet.updateTimesheet(id, user_id, week_1, week_2, timesheet_data, flatRateItems, explanationItems, submitted)
Timesheet.updateTimesheet = async function (
  id,
  user_id,
  week_1,
  week_2,
  timesheet_data,
  flatRateItems,
  explanationItems,
  submitted
) {
  try {
    const timesheet = await Timesheet.update(
      {
        user_id,
        week_1,
        week_2,
        timesheet_data,
        flatRateItems,
        explanationItems,
        submitted
      },
      {
        where: { id },
      }
    );
  } catch (error) {
    console.error("Error updating timesheet:", error);
  }
};

// Deletes a timesheet by id.
Timesheet.deleteById = async function (id) {
  try {
    const timesheet = await Timesheet.destroy({
      where: { id },
    });
  } catch (error) {
    console.error("Error deleting timesheet:", error);
  }
};

// Gets all timesheets.
Timesheet.getAllTimesheets = async function () {
  try {
    const timesheets = await Timesheet.findAll();
    return timesheets;
  } catch (error) {
    console.error("Error getting all timesheets:", error);
  }
};

// Gets all timesheets by user id.
Timesheet.getAllTimesheetsByUserId = async function (id) {
  try {
    const timesheets = await Timesheet.findAll({
      where: { user_id: id },
    });
    return timesheets;
  } catch (error) {
    console.error("Error getting all timesheets by user id:", error);
  }
};

// Parses timesheet data.
Timesheet.parseData = async function (id) {
  try {
    const timesheet = await Timesheet.findById(id);
    const week1_data = timesheet.week_1;
    const week2_data = timesheet.week_2;
    const timesheet_data = timesheet.timesheet_data;
    const parsed_data = {
      week_1,
      week_2,
      timesheet_data,
    };

    return JSON.stringify(parsed_data);
  } catch (error) {
    console.error("Error parsing timesheet data:", error);
  }
};

Timesheet.isDuplicate = async function (user_id, payPeriodName) {
  var lastTimesheet = User.getLastTimesheet(user_id);
  console.log("1. Last timesheet: " + JSON.stringify(lastTimesheet));
  var lastTimesheetData = Timesheet.findById(lastTimesheet);
  console.log("2. Last timesheet data: " + JSON.stringify(lastTimesheetData));
  var lastTimesheetPayPeriod = lastTimesheetData;
  console.log("3. Last timesheet pay period: " + lastTimesheetPayPeriod);

  console.log("Last timesheet pay period: " + lastTimesheetPayPeriod);

  if (lastTimesheetPayPeriod == payPeriodName) {
    return true;
  } else {
    return false;
  }
};

module.exports = Timesheet;
