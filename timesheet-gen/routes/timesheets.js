var express = require("express");
const Timesheet = require("./models/timesheet_model.js");
const session = require("express-session");
const mysql = require("mysql2");
var config = require("../config");
const PDFDocument = require("pdfkit-table");
const blobStream = require("blob-stream");
const User = require("./models/user_model.js");
var nodemailer = require("nodemailer");
var router = express.Router();
var middlewares = require("../middlewares.js");
const fs = require("fs");
const stream = require("stream");
const notifier = require("node-notifier");
const path = require('node:path');

const { save } = require("pdfkit");

/**
 * Generates a PDF of the timesheet.
 * @param {string} pay_period_start - the start date of the pay period.
 * @param {string} pay_period_name - the name of the pay period.
 * @param {string} employee_name - the name of the employee.
 * @param {string} notes - the notes for the timesheet.
 * @param {number} fr_row_count - the number of flat rate rows.
 * @param {boolean} showFlatRateItems - whether or not to show the flat rate items.
 * @param {string[]} payPeriods -
 */
// Route for create post request from the timesheet form.
// Create a new timesheet
router.post("/create", middlewares.restrictor, async function (req, res, next) {
  var pay_period_start = req.body.pay_period_start;
  var payPeriodName = req.body.pay_period_name || "Pay Period Not Selected";
  var employee_name = req.body.employee_name;
  var employee_id = req.body.employee_id;
  var notes = req.body.notes;
  var explanation = req.body.explanation;
  var selectedBase = req.body.base;
  var fr_row_count = parseInt(req.body.fr_row_count) || 0;
  var exp_row_count = parseInt(req.body.exp_row_count) || 0;
  var proxy = req.body.proxy;


  // Save and Send Timesheet?
  var doSaveTimesheet = true;
  var doSendTimesheet = true;

  var showFlatRateItems = false;
  var showExplanationItems = false;
  var payPeriods = generatePayPeriods();
  var bases = generateBases();
  var payPeriod = payPeriods.filter(function (period) {
    return period.name === payPeriodName;
  });
  payPeriod = payPeriod[0] || "Pay Period Not Selected";

  var user = await User.findById(parseInt(employee_id));

  var timesheet_data = [
    {
      payPeriod: payPeriod,
      payPeriodName: payPeriodName,
      employee_name: employee_name,
      notes: notes,
      explanation: explanation,
      selectedBase: selectedBase,
      userEmail: user.email,
    },
  ];

  var week_1_data = [
    {
      day: req.body.week_1_sun_date,
      time_on: req.body.week_1_sun_time_on,
      time_off: req.body.week_1_sun_time_off,
      reg_hours: req.body.week_1_sun_regular_hours,
      extra_hours: req.body.week_1_sun_extra_hours,
      vacation: req.body.week_1_sun_vacation_hours,
      unit: req.body.week_1_sun_unit,
      total: req.body.week_1_sun_total,
      date: req.body.week_1_sun_dateFull,
    },
    {
      day: req.body.week_1_mon_date,
      time_on: req.body.week_1_mon_time_on,
      time_off: req.body.week_1_mon_time_off,
      reg_hours: req.body.week_1_mon_regular_hours,
      extra_hours: req.body.week_1_mon_extra_hours,
      vacation: req.body.week_1_mon_vacation_hours,
      unit: req.body.week_1_mon_unit,
      total: req.body.week_1_mon_total,
      date: req.body.week_1_mon_dateFull,
    },
    {
      day: req.body.week_1_tue_date,
      time_on: req.body.week_1_tue_time_on,
      time_off: req.body.week_1_tue_time_off,
      reg_hours: req.body.week_1_tue_regular_hours,
      extra_hours: req.body.week_1_tue_extra_hours,
      vacation: req.body.week_1_tue_vacation_hours,
      unit: req.body.week_1_tue_unit,
      total: req.body.week_1_tue_total,
      date: req.body.week_1_tue_dateFull,
    },
    {
      day: req.body.week_1_wed_date,
      time_on: req.body.week_1_wed_time_on,
      time_off: req.body.week_1_wed_time_off,
      reg_hours: req.body.week_1_wed_regular_hours,
      extra_hours: req.body.week_1_wed_extra_hours,
      vacation: req.body.week_1_wed_vacation_hours,
      unit: req.body.week_1_wed_unit,
      total: req.body.week_1_wed_total,
      date: req.body.week_1_wed_dateFull,
    },
    {
      day: req.body.week_1_thu_date,
      time_on: req.body.week_1_thu_time_on,
      time_off: req.body.week_1_thu_time_off,
      reg_hours: req.body.week_1_thu_regular_hours,
      extra_hours: req.body.week_1_thu_extra_hours,
      vacation: req.body.week_1_thu_vacation_hours,
      unit: req.body.week_1_thu_unit,
      total: req.body.week_1_thu_total,
      date: req.body.week_1_thu_dateFull,
    },
    {
      day: req.body.week_1_fri_date,
      time_on: req.body.week_1_fri_time_on,
      time_off: req.body.week_1_fri_time_off,
      reg_hours: req.body.week_1_fri_regular_hours,
      extra_hours: req.body.week_1_fri_extra_hours,
      vacation: req.body.week_1_fri_vacation_hours,
      unit: req.body.week_1_fri_unit,
      total: req.body.week_1_fri_total,
      date: req.body.week_1_fri_dateFull,
    },
    {
      day: req.body.week_1_sat_date,
      time_on: req.body.week_1_sat_time_on,
      time_off: req.body.week_1_sat_time_off,
      reg_hours: req.body.week_1_sat_regular_hours,
      extra_hours: req.body.week_1_sat_extra_hours,
      vacation: req.body.week_1_sat_vacation_hours,
      unit: req.body.week_1_sat_unit,
      total: req.body.week_1_sat_total,
      date: req.body.week_1_sat_dateFull,
    },
  ];

  var week_2_data = [
    {
      day: req.body.week_2_sun_date,
      time_on: req.body.week_2_sun_time_on,
      time_off: req.body.week_2_sun_time_off,
      reg_hours: req.body.week_2_sun_regular_hours,
      extra_hours: req.body.week_2_sun_extra_hours,
      vacation: req.body.week_2_sun_vacation_hours,
      unit: req.body.week_2_sun_unit,
      total: req.body.week_2_sun_total,
      date: req.body.week_2_sun_dateFull,
    },
    {
      day: req.body.week_2_mon_date,
      time_on: req.body.week_2_mon_time_on,
      time_off: req.body.week_2_mon_time_off,
      reg_hours: req.body.week_2_mon_regular_hours,
      extra_hours: req.body.week_2_mon_extra_hours,
      vacation: req.body.week_2_mon_vacation_hours,
      unit: req.body.week_2_mon_unit,
      total: req.body.week_2_mon_total,
      date: req.body.week_2_mon_dateFull,
    },
    {
      day: req.body.week_2_tue_date,
      time_on: req.body.week_2_tue_time_on,
      time_off: req.body.week_2_tue_time_off,
      reg_hours: req.body.week_2_tue_regular_hours,
      extra_hours: req.body.week_2_tue_extra_hours,
      vacation: req.body.week_2_tue_vacation_hours,
      unit: req.body.week_2_tue_unit,
      total: req.body.week_2_tue_total,
      date: req.body.week_2_tue_dateFull,
    },
    {
      day: req.body.week_2_wed_date,
      time_on: req.body.week_2_wed_time_on,
      time_off: req.body.week_2_wed_time_off,
      reg_hours: req.body.week_2_wed_regular_hours,
      extra_hours: req.body.week_2_wed_extra_hours,
      vacation: req.body.week_2_wed_vacation_hours,
      unit: req.body.week_2_wed_unit,
      total: req.body.week_2_wed_total,
      date: req.body.week_2_wed_dateFull,
    },
    {
      day: req.body.week_2_thu_date,
      time_on: req.body.week_2_thu_time_on,
      time_off: req.body.week_2_thu_time_off,
      reg_hours: req.body.week_2_thu_regular_hours,
      extra_hours: req.body.week_2_thu_extra_hours,
      vacation: req.body.week_2_thu_vacation_hours,
      unit: req.body.week_2_thu_unit,
      total: req.body.week_2_thu_total,
      date: req.body.week_2_thu_dateFull,
    },
    {
      day: req.body.week_2_fri_date,
      time_on: req.body.week_2_fri_time_on,
      time_off: req.body.week_2_fri_time_off,
      reg_hours: req.body.week_2_fri_regular_hours,
      extra_hours: req.body.week_2_fri_extra_hours,
      vacation: req.body.week_2_fri_vacation_hours,
      unit: req.body.week_2_fri_unit,
      total: req.body.week_2_fri_total,
      date: req.body.week_2_fri_dateFull,
    },
    {
      day: req.body.week_2_sat_date,
      time_on: req.body.week_2_sat_time_on,
      time_off: req.body.week_2_sat_time_off,
      reg_hours: req.body.week_2_sat_regular_hours,
      extra_hours: req.body.week_2_sat_extra_hours,
      vacation: req.body.week_2_sat_vacation_hours,
      unit: req.body.week_2_sat_unit,
      total: req.body.week_2_sat_total,
      date: req.body.week_2_sat_dateFull,
    },
  ];

  var vacation_hours_total = 0;

  let week_1_regular_hours_total = 0;
  let week_1_overtime_hours = 0;
  let week_2_regular_hours_total = 0;
  let week_2_overtime_hours = 0;

  week_1_data.forEach((data) => {
    const regHours = parseFloat(data.reg_hours || 0);
    const totalHours = parseFloat(data.total || 0).toFixed(2);

    if (week_1_regular_hours_total + parseFloat(totalHours) <= 40) {
      week_1_regular_hours_total += parseFloat(totalHours);
    } else {
      const overtime = parseFloat(totalHours) - (40 - week_1_regular_hours_total);
      week_1_overtime_hours += overtime;
      week_1_regular_hours_total = 40;
    }
  });

  week_2_data.forEach((data) => {
    const regHours = parseFloat(data.reg_hours || 0);
    const totalHours = parseFloat(data.total || 0).toFixed(2);

    if (week_2_regular_hours_total + parseFloat(totalHours) <= 40) {
      week_2_regular_hours_total += parseFloat(totalHours);
    } else {
      const overtime = parseFloat(totalHours) - (40 - week_2_regular_hours_total);
      week_2_overtime_hours += overtime;
      week_2_regular_hours_total = 40;
    }
  });
    

  /* Holiday Calculation */
  // determine if any of the days are holidays. If so we want to give the employee time and a half hours
  var week_1_holiday_hours = 0;
  var week_2_holiday_hours = 0;
  var holiday_hours_total = 0;

  for (var i = 0; i < week_1_data.length; i++) {
    if (isHoliday(new Date(week_1_data[i].date))) {
      var holidayPay = parseFloat(week_1_data[i].reg_hours) * 1.5;
      week_1_holiday_hours += parseFloat(holidayPay);
      holiday_hours_total += parseFloat(holidayPay);
    }
  }
  for (var i = 0; i < week_2_data.length; i++) {
    if (isHoliday(new Date(week_2_data[i].date))) {
      var holidayPay = parseFloat(week_2_data[i].reg_hours) * 1.5;
      week_2_holiday_hours += parseFloat(holidayPay);
      holiday_hours_total += parseFloat(holidayPay);
    }
  }
  /* End Holiday Calculation */

  /* Flat rate calculation */

  const flatRateItems = [];
  function generateFlatRateItems() {
    for (var i = 0; i < fr_row_count; i++) {
      var fr_row_data = {
        date: req.body["fr_date_" + i],
        time_on: req.body["fr_time_on_" + i],
        time_off: req.body["fr_time_off_" + i],
        run_number: req.body["fr_run_number_" + i],
        explaination: req.body["fr_explaination_" + i],
      };
      flatRateItems.push(fr_row_data);
    }
  }

  function getFlatRateRowData() {
    generateFlatRateItems();

    var items = [];
    for (var i = 0; i < flatRateItems.length; i++) {
      items.push([
        flatRateItems[i].date,
        flatRateItems[i].time_on,
        flatRateItems[i].time_off,
        flatRateItems[i].run_number,
        flatRateItems[i].explaination,
      ]);
    }
    return items;
  }

  const flatRateTable = {
    title: "Flat Rate Items",
    headers: ["Date", "Time On", "Time Off", "Run Number", "Explaination"],
    rows: getFlatRateRowData(),
  };

  //if(fr_row_count != 0 || fr_row_count != null) {
  //  showFlatRateItems = true;
  //};

  if (fr_row_count > 0) {
    showFlatRateItems = true;
  }

  /* End Flat rate calculation */

  /* Explanation Item calculation */
  const explanationItems = [];
  function generateExplanationItems() {
    for (var i = 0; i < exp_row_count; i++) {
      var exp_row_data = {
        date: req.body["exp_date_" + i],
        time_on: req.body["exp_time_on_" + i],
        time_off: req.body["exp_time_off_" + i],
        run_number: req.body["exp_run_number_" + i],
        explaination: req.body["exp_explaination_" + i],
      };
      explanationItems.push(exp_row_data);
    }
  }

  function getExplanationRowData() {
    generateExplanationItems();

    var items = [];
    for (var i = 0; i < explanationItems.length; i++) {
      items.push([
        explanationItems[i].date,
        explanationItems[i].time_on,
        explanationItems[i].time_off,
        explanationItems[i].run_number,
        explanationItems[i].explaination,
      ]);
    }
    return items;
  }

  const explanationTable = {
    title: "Explanations",
    headers: ["Date", "Time On", "Time Off", "Run Number", "Explaination"],
    rows: getExplanationRowData(),
  };

  //if(exp_row_count != 0 || exp_row_count != null) {
  //  showExplanationItems = true;
  //};

  if (exp_row_count > 0) {
    showExplanationItems = true;
  }

  /* End Explanation Item calculation */

  let week_1_holiday_hours_total = 0;
  let week_2_holiday_hours_total = 0;

  /* End Calculate the total hours for the pay period */

  const doc = new PDFDocument();
  const stream = doc.pipe(blobStream());

  doc.fontSize(12).text("Employee: " + employee_name, 60, 15);
  doc.fontSize(12).text("Pay Period: " + payPeriodName, 60, 30);
  //doc.fontSize(12).text("Base: " + selectedBase, 60, 45)
  doc.moveDown();

  const pdf_table = {
    title: "Week 1",
    headers: [
      "Day",
      "Time On",
      "Time Off",
      "Regular",
      "Other",
      "Vacation",
      "Unit",
      "Total",
    ],
    rows: [
      [
        week_1_data[0].day,
        week_1_data[0].time_on,
        week_1_data[0].time_off,
        week_1_data[0].reg_hours || 0,
        week_1_data[0].extra_hours || 0,
        week_1_data[0].vacation || 0,
        week_1_data[0].unit,
        week_1_data[0].total || 0,
      ],
      [
        week_1_data[1].day,
        week_1_data[1].time_on,
        week_1_data[1].time_off,
        week_1_data[1].reg_hours || 0,
        week_1_data[1].extra_hours || 0,
        week_1_data[1].vacation || 0,
        week_1_data[1].unit,
        week_1_data[1].total || 0,
      ],
      [
        week_1_data[2].day,
        week_1_data[2].time_on,
        week_1_data[2].time_off,
        week_1_data[2].reg_hours || 0,
        week_1_data[2].extra_hours || 0,
        week_1_data[2].vacation || 0,
        week_1_data[2].unit,
        week_1_data[2].total || 0,
      ],
      [
        week_1_data[3].day,
        week_1_data[3].time_on,
        week_1_data[3].time_off,
        week_1_data[3].reg_hours || 0,
        week_1_data[3].extra_hours || 0,
        week_1_data[3].vacation || 0,
        week_1_data[3].unit,
        week_1_data[3].total || 0,
      ],
      [
        week_1_data[4].day,
        week_1_data[4].time_on,
        week_1_data[4].time_off,
        week_1_data[4].reg_hours || 0,
        week_1_data[4].extra_hours || 0,
        week_1_data[4].vacation || 0,
        week_1_data[4].unit,
        week_1_data[4].total || 0,
      ],
      [
        week_1_data[5].day,
        week_1_data[5].time_on,
        week_1_data[5].time_off,
        week_1_data[5].reg_hours || 0,
        week_1_data[5].extra_hours || 0,
        week_1_data[5].vacation || 0,
        week_1_data[5].unit,
        week_1_data[5].total || 0,
      ],
      [
        week_1_data[6].day,
        week_1_data[6].time_on,
        week_1_data[6].time_off,
        week_1_data[6].reg_hours || 0,
        week_1_data[6].extra_hours || 0,
        week_1_data[6].vacation || 0,
        week_1_data[6].unit,
        week_1_data[6].total || 0,
      ],
    ],
  };

  doc.table(pdf_table, {
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
    prepareRow: (row, i) => doc.font("Helvetica").fontSize(8),
  });

  const pdf_table2 = {
    title: "Week 2",
    headers: [
      "Day",
      "Time On",
      "Time Off",
      "Regular",
      "Other",
      "Vacation",
      "Unit",
      "Total",
    ],
    rows: [
      [
        week_2_data[0].day,
        week_2_data[0].time_on,
        week_2_data[0].time_off,
        week_2_data[0].reg_hours || 0,
        week_2_data[0].extra_hours || 0,
        week_2_data[0].vacation || 0,
        week_2_data[0].unit,
        week_2_data[0].total || 0,
      ],
      [
        week_2_data[1].day,
        week_2_data[1].time_on,
        week_2_data[1].time_off,
        week_2_data[1].reg_hours || 0,
        week_2_data[1].extra_hours || 0,
        week_2_data[0].vacation || 0,
        week_2_data[1].unit,
        week_2_data[1].total || 0,
      ],
      [
        week_2_data[2].day,
        week_2_data[2].time_on,
        week_2_data[2].time_off,
        week_2_data[2].reg_hours || 0,
        week_2_data[2].extra_hours || 0,
        week_2_data[2].vacation || 0,
        week_2_data[2].unit,
        week_2_data[2].total || 0,
      ],
      [
        week_2_data[3].day,
        week_2_data[3].time_on,
        week_2_data[3].time_off,
        week_2_data[3].reg_hours || 0,
        week_2_data[3].extra_hours || 0,
        week_2_data[3].vacation || 0,
        week_2_data[3].unit,
        week_2_data[3].total || 0,
      ],
      [
        week_2_data[4].day,
        week_2_data[4].time_on,
        week_2_data[4].time_off,
        week_2_data[4].reg_hours || 0,
        week_2_data[4].extra_hours || 0,
        week_2_data[4].vacation || 0,
        week_2_data[4].unit,
        week_2_data[4].total || 0,
      ],
      [
        week_2_data[5].day,
        week_2_data[5].time_on,
        week_2_data[5].time_off,
        week_2_data[5].reg_hours || 0,
        week_2_data[5].extra_hours || 0,
        week_2_data[5].vacation || 0,
        week_2_data[5].unit,
        week_2_data[5].total || 0,
      ],
      [
        week_2_data[6].day,
        week_2_data[6].time_on,
        week_2_data[6].time_off,
        week_2_data[6].reg_hours || 0,
        week_2_data[6].extra_hours || 0,
        week_2_data[6].vacation || 0,
        week_2_data[6].unit,
        week_2_data[6].total || 0,
      ],
    ],
  };

  doc.table(pdf_table2, {
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
    prepareRow: (row, i) => doc.font("Helvetica").fontSize(8),
    hideHeader: false,
  });

  if (showFlatRateItems) {
    doc.table(flatRateTable, {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
      prepareRow: (row, i) => doc.font("Helvetica").fontSize(8),
    });
  } else {
    console.log("Table creation: Flat Rate Items table not created.");
  }
  if (showExplanationItems) {
    doc.table(explanationTable, {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
      prepareRow: (row, i) => doc.font("Helvetica").fontSize(8),
    });
  }

      // Create total table
  const totalTable = {
        title: "Totals",
        headers: [
          "Week 1 Regular",
          "Week 1 OT",
          "Week 2 Regular",
          "Week 2 OT",
          "Vacation",
          "Holiday",
          "Flat Rate",
        ],
        rows: [
          [
            week_1_regular_hours_total,
            parseFloat(week_1_overtime_hours).toFixed(2),
            week_2_regular_hours_total,
            parseFloat(week_2_overtime_hours).toFixed(2),
            vacation_hours_total,
            holiday_hours_total,
            fr_row_count,
          ],
        ],
      };
      

  doc.table(totalTable, {
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
    prepareRow: (row, i) => doc.font("Helvetica").fontSize(8),
  });

  doc.end();

  let buffers = [];
  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", () => {
    let pdfData = Buffer.concat(buffers);
    if (doSendTimesheet) {
      sendTimesheet(timesheet_data, pdfData);
    }
    if (doSaveTimesheet) {
      employee_id = parseInt(employee_id);
      if (showFlatRateItems && showExplanationItems) {
        saveTimesheet(employee_id, week_1_data, week_2_data, timesheet_data, flatRateItems, explanationItems, doSendTimesheet);
      }else if (showExplanationItems && !showFlatRateItems) {
        saveTimesheet(employee_id, week_1_data, week_2_data, timesheet_data, null, explanationItems, doSendTimesheet);
      }else if (!showExplanationItems && showFlatRateItems) {
        saveTimesheet(employee_id, week_1_data, week_2_data, timesheet_data, flatRateItems, null, doSendTimesheet);
      }else{ 
        saveTimesheet(employee_id, week_1_data, week_2_data, timesheet_data, null, null, doSendTimesheet);
      }
    }

      //res.redirect('/user/timesheets');
      res.redirect("back");

    notifier.notify(
      "Timesheet successfully submitted! You can safely close the window now."
    );
  });
});

// Sends a timesheet.
function sendTimesheet(data, pdfData) {
  const transporter = nodemailer.createTransport({
    service: config.email.service,
    auth: {
      user: config.email.username,
      pass: config.email.password,
    },
  });

  const mailData = {
    from: config.email.from,
    to: config.email.destination,
    cc: data[0].userEmail,
    subject:
      "Timesheet submitted for " +
      data[0].employee_name +
      " - " +
      data[0].payPeriodName,
    text:
      "Timesheet submitted for " +
      data[0].employee_name +
      " - " +
      data[0].payPeriodName,
    html:
      "<p>Timesheet submitted for " +
      data[0].employee_name +
      " - " +
      data[0].payPeriodName +
      "</p>",
    attachments: [
      {
        filename:
          data[0].employee_name + " - " + data[0].payPeriodName + ".pdf",
        content: pdfData,
      },
    ],
  };

  transporter.sendMail(mailData, (error, info) => {
    if (error) {
      return console.log(error);
    }
    res.status(200).send({ message: "Email sent successfully!", data: info });
  });
  // Returns true if the request was successful.
}

// Saves a timesheet to the database
async function saveTimesheet(user_id, week_1, week_2, timesheet_data, flatRateItems, explanationItems, submitted) {
  try {
    if (!user_id) {
      throw new Error("User ID is missing or invalid");
    }
    Timesheet.createTimesheet(user_id, week_1, week_2, timesheet_data, flatRateItems, explanationItems, submitted);

    console.log("Timesheet saved successfully");
  } catch (error) {
    console.error(
      "Unable to save timesheet to database. It was still sent!",
      error
    );
  }
}

// Updates a timesheet.
async function updateTimesheet(id, user_id, week_1, week_2, timesheet_data, flatRateItems, explanationItems, submitted) {
  try {
    if (!user_id) {
      throw new Error("User ID is missing or invalid");
    }

    Timesheet.updateTimesheet(user_id, week_1, week_2, timesheet_data, flatRateItems, explanationItems, submitted);
    console.log("Timesheet saved successfully");
  } catch (error) {
    console.error(
      "Unable to save timesheet to database. It was still sent!",
      error
    );
  }
}

// Generates pay periods.
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

// Generates the base names for the county.
function generateBases() {
  var bases = [
    {
      name: "Crawford County",
      id: 1,
    },
    {
      name: "Montgomery County",
      id: 2,
    },
    {
      name: "Polk County",
      id: 3,
    },
    {
      name: "Sevier County",
      id: 4,
    },
  ];

  return bases;
}

// Found on https://stackoverflow.com/questions/68943673/js-check-for-holidays
// Checks if a date is a holiday
function isHoliday(dt_date) {
  // check simple dates (month/date - no leading zeroes)
  var n_date = dt_date.getDate(),
    n_month = dt_date.getMonth() + 1;
  var s_date1 = n_month + "/" + n_date;

  if (
    s_date1 == "7/4" || // Independence Day
    s_date1 == "12/25" // Christmas Day
  )
    return true;

  // weekday from beginning of the month (month/num/day)
  var n_wday = dt_date.getDay(),
    n_wnum = Math.floor((n_date - 1) / 7) + 1;
  var s_date2 = n_month + "/" + n_wnum + "/" + n_wday;

  if (
    s_date2 == "11/4/4" // Thanksgiving Day, fourth Thursday in November
  )
    return true;

  // weekday number from end of the month (month/num/day)
  var dt_temp = new Date(dt_date);
  dt_temp.setDate(1);
  dt_temp.setMonth(dt_temp.getMonth() + 1);
  dt_temp.setDate(dt_temp.getDate() - 1);
  n_wnum = Math.floor((dt_temp.getDate() - n_date - 1) / 7) + 1;
  var s_date3 = n_month + "/" + n_wnum + "/" + n_wday;

  if (
    s_date3 == "5/1/1" // Memorial Day, last Monday in May
  )
    return true;

  return false;
}

// Renders a new timesheet
router.get("/new", middlewares.restrictor, function (req, res, next) {
  var payPeriods = generatePayPeriods();
  res.render("new_timesheet", {
    title: "SWEMS Timesheet",
    payPeriods: payPeriods,
    user: [
      req.session.first_name,
      req.session.last_name,
      req.session.base,
      req.session.userId,
    ],
    proxy: false,
  });
});

// Handle admin creation of timesheet for specific user
router.get("/new/:id", middlewares.restrictor, async function (req, res, next) {
  let adminUserId = req.session.userId;
  const isAdmin = await User.isAdministrator(adminUserId);

  var proxyUserId = req.params.id;
  var proxyUser = await User.findById(proxyUserId);

  console.log(
    "Proxy user: " +
      proxyUser.first_name +
      " " +
      proxyUser.last_name +
      " (" +
      proxyUser.userId +
      ")"
  );

  if (isAdmin) {
    var payPeriods = generatePayPeriods();
    res.render("new_timesheet", {
      title: "SWEMS Timesheet",
      payPeriods: payPeriods,
      user: [
        proxyUser.first_name,
        proxyUser.last_name,
        proxyUser.base,
        proxyUserId,
      ],
      bases: proxyUser.base,
      proxy: true,
    });
  }
});

// Renders the SWEMS Timesheet Dashboard
router.get(
  "/dashboard",
  middlewares.restrictor,
  async function (req, res, next) {
    let userId = req.session.userId;
    const isAdmin = await User.isAdministrator(userId);

    res.render("dashboard", {
      title: "SWEMS Timesheet Dashboard",
      user: [req.session.first_name, req.session.last_name],
      isAdmin,
    });
  }
);

// /timesheets/delete/:{timesheet.id}
// Delete a timesheet
router.get(
  "/delete/:id",
  middlewares.restrictor,
  async function (req, res, next) {
    let userId = req.session.userId;
    const isAdmin = await User.isAdministrator(userId);

    if (isAdmin) {
      const timesheetId = req.params.id;
      Timesheet.deleteById(timesheetId);
      // redirect to the page the request came from
      res.redirect("back");
    } else {
      res.redirect("/dashboard");
    }
  }
);

// Download a timesheet
router.get(
  "/download/:id",
  middlewares.restrictor,
  async function (req, res, next) {
    let userId = req.session.userId;
    const isAdmin = await User.isAdministrator(userId);
    const timesheetId = req.params.id;

    if (isAdmin) {
      const timesheetData = await Timesheet.findById(timesheetId);
      var empName = timesheetData.timesheet_data[0].employee_name;
      var payPeriodName = timesheetData.timesheet_data[0].payPeriod.name;
      var week_1_data = timesheetData.week_1;
      var week_2_data = timesheetData.week_2;

      var displayFR = false;
      var dispalyEXP = false;

      var flatRateItems = [];
      if (timesheetData.flatRateItems == null) {
        displayFR = false;
        flatRateItems = [];
      }else{
        displayFR = true;
        flatRateItems = timesheetData.flatRateItems;
      }

      var explanationItems = [];
      if (timesheetData.explanationItems == null) {
        dispalyEXP = false;
        explanationItems = [];
      }else{
        dispalyEXP = true;
        explanationItems = timesheetData.explanationItems;
      }
      // generatePDF = (employee_name, payPeriodName, week_1_data, week_2_data, flatRateItems, explanationItems, showFlatRateItems, showExplanationItems, res)
      console.log("Attempting download....");
      generatePDF(
        empName,
        payPeriodName,
        week_1_data,
        week_2_data,
        flatRateItems,
        explanationItems,
        displayFR,
        dispalyEXP,
        res
      );
      console.log("Post download function...");
    } else {
      alert("You do not have permission to download this timesheet.");
      res.redirect("/dashboard");
    }
  }
);

// Renders the edit timesheet
router.get(
  "/edit/:id",
  middlewares.restrictor,
  async function (req, res, next) {
    const timesheetId = req.params.id;
    try {
      const timesheetData = await Timesheet.findById(timesheetId);
      if (!timesheetData) {
        res.redirect('/');
        return;
      }
      const timesheetUser = await User.findById(timesheetData.user_id);

      var week1Data = timesheetData.week_1;
      var week2Data = timesheetData.week_2;
      var tsData = timesheetData.timesheet_data;
      var frData = timesheetData.flatRateItems;
      var exData = timesheetData.explanationItems;
  
      let userId = req.session.userId;
      var payPeriods = generatePayPeriods();
      res.render("edit_timesheet", {
        payPeriods: payPeriods,
        user: [
          timesheetUser.first_name,
          timesheetUser.last_name,
          timesheetUser.base,
          timesheetUser.id,
        ],
        timesheet: {
          //timesheet.misc.payPeriod.start
          week_1: week1Data,
          week_2: week2Data,
          timesheet_data: tsData,
          flatRateItems: frData,
          explainationItems: exData,
        },
        timesheetId: timesheetId,
      });
    } catch (error) {
      console.error(error);
      res.redirect('/');
    }
  }
);

router.get(
  "/view/:id",
  middlewares.restrictor,
  async function (req, res, next) {
    const timesheetId = req.params.id;
    const timesheetData = await Timesheet.findById(timesheetId);
    const timesheetUser = await User.findById(timesheetData.user_id);

    var week1Data = timesheetData.week_1;
    var week2Data = timesheetData.week_2;
    var miscData = timesheetData.timesheet_data;

    let userId = req.session.userId;
    var payPeriods = generatePayPeriods();
    res.render("edit_timesheet", {
      payPeriods: payPeriods,
      user: [
        timesheetUser.first_name,
        timesheetUser.last_name,
        timesheetUser.base,
        timesheetUser.id,
      ],
      timesheet: {
        week_1: week1Data,
        week_2: week2Data,
        misc: miscData,
      },
      timesheetId: timesheetId,
    });
  }
);

// Save a new timesheet.
router.post("/save/", middlewares.restrictor, async function (req, res, next) {
  var payPeriodName = req.body.pay_period_name;
  var employee_name = req.body.employee_name;
  var employee_id = req.body.employee_id;
  var notes = req.body.notes;
  var explanation = req.body.explanation;
  var selectedBase = req.body.base;

  var payPeriods = generatePayPeriods();
  var payPeriod = payPeriods.filter(function (period) {
    return period.name === payPeriodName;
  });
  payPeriod = payPeriod[0];

  var user = User.findById(parseInt(employee_id));

  var timesheet_data = [
    {
      payPeriod: payPeriod,
      payPeriodName: payPeriodName,
      employee_name: employee_name,
      notes: notes,
      explanation: explanation,
      selectedBase: selectedBase,
      userEmail: user.email,
    },
  ];

  var week_1_data = [
    {
      day: req.body.week_1_sun_date,
      time_on: req.body.week_1_sun_time_on,
      time_off: req.body.week_1_sun_time_off,
      reg_hours: req.body.week_1_sun_regular_hours,
      extra_hours: req.body.week_1_sun_extra_hours,
      vacation: req.body.week_1_sun_vacation_hours,
      unit: req.body.week_1_sun_unit,
      total: req.body.week_1_sun_total,
      date: req.body.week_1_sun_dateFull,
    },
    {
      day: req.body.week_1_mon_date,
      time_on: req.body.week_1_mon_time_on,
      time_off: req.body.week_1_mon_time_off,
      reg_hours: req.body.week_1_mon_regular_hours,
      extra_hours: req.body.week_1_mon_extra_hours,
      vacation: req.body.week_1_mon_vacation_hours,
      unit: req.body.week_1_mon_unit,
      total: req.body.week_1_mon_total,
      date: req.body.week_1_mon_dateFull,
    },
    {
      day: req.body.week_1_tue_date,
      time_on: req.body.week_1_tue_time_on,
      time_off: req.body.week_1_tue_time_off,
      reg_hours: req.body.week_1_tue_regular_hours,
      extra_hours: req.body.week_1_tue_extra_hours,
      vacation: req.body.week_1_tue_vacation_hours,
      unit: req.body.week_1_tue_unit,
      total: req.body.week_1_tue_total,
      date: req.body.week_1_tue_dateFull,
    },
    {
      day: req.body.week_1_wed_date,
      time_on: req.body.week_1_wed_time_on,
      time_off: req.body.week_1_wed_time_off,
      reg_hours: req.body.week_1_wed_regular_hours,
      extra_hours: req.body.week_1_wed_extra_hours,
      vacation: req.body.week_1_wed_vacation_hours,
      unit: req.body.week_1_wed_unit,
      total: req.body.week_1_wed_total,
      date: req.body.week_1_wed_dateFull,
    },
    {
      day: req.body.week_1_thu_date,
      time_on: req.body.week_1_thu_time_on,
      time_off: req.body.week_1_thu_time_off,
      reg_hours: req.body.week_1_thu_regular_hours,
      extra_hours: req.body.week_1_thu_extra_hours,
      vacation: req.body.week_1_thu_vacation_hours,
      unit: req.body.week_1_thu_unit,
      total: req.body.week_1_thu_total,
      date: req.body.week_1_thu_dateFull,
    },
    {
      day: req.body.week_1_fri_date,
      time_on: req.body.week_1_fri_time_on,
      time_off: req.body.week_1_fri_time_off,
      reg_hours: req.body.week_1_fri_regular_hours,
      extra_hours: req.body.week_1_fri_extra_hours,
      vacation: req.body.week_1_fri_vacation_hours,
      unit: req.body.week_1_fri_unit,
      total: req.body.week_1_fri_total,
      date: req.body.week_1_fri_dateFull,
    },
    {
      day: req.body.week_1_sat_date,
      time_on: req.body.week_1_sat_time_on,
      time_off: req.body.week_1_sat_time_off,
      reg_hours: req.body.week_1_sat_regular_hours,
      extra_hours: req.body.week_1_sat_extra_hours,
      vacation: req.body.week_1_sat_vacation_hours,
      unit: req.body.week_1_sat_unit,
      total: req.body.week_1_sat_total,
      date: req.body.week_1_sat_dateFull,
    },
  ];

  var week_2_data = [
    {
      day: req.body.week_2_sun_date,
      time_on: req.body.week_2_sun_time_on,
      time_off: req.body.week_2_sun_time_off,
      reg_hours: req.body.week_2_sun_regular_hours,
      extra_hours: req.body.week_2_sun_extra_hours,
      vacation: req.body.week_2_sun_vacation_hours,
      unit: req.body.week_2_sun_unit,
      total: req.body.week_2_sun_total,
      date: req.body.week_2_sun_dateFull,
    },
    {
      day: req.body.week_2_mon_date,
      time_on: req.body.week_2_mon_time_on,
      time_off: req.body.week_2_mon_time_off,
      reg_hours: req.body.week_2_mon_regular_hours,
      extra_hours: req.body.week_2_mon_extra_hours,
      vacation: req.body.week_2_mon_vacation_hours,
      unit: req.body.week_2_mon_unit,
      total: req.body.week_2_mon_total,
      date: req.body.week_2_mon_dateFull,
    },
    {
      day: req.body.week_2_tue_date,
      time_on: req.body.week_2_tue_time_on,
      time_off: req.body.week_2_tue_time_off,
      reg_hours: req.body.week_2_tue_regular_hours,
      extra_hours: req.body.week_2_tue_extra_hours,
      vacation: req.body.week_2_tue_vacation_hours,
      unit: req.body.week_2_tue_unit,
      total: req.body.week_2_tue_total,
      date: req.body.week_2_tue_dateFull,
    },
    {
      day: req.body.week_2_wed_date,
      time_on: req.body.week_2_wed_time_on,
      time_off: req.body.week_2_wed_time_off,
      reg_hours: req.body.week_2_wed_regular_hours,
      extra_hours: req.body.week_2_wed_extra_hours,
      vacation: req.body.week_2_wed_vacation_hours,
      unit: req.body.week_2_wed_unit,
      total: req.body.week_2_wed_total,
      date: req.body.week_2_wed_dateFull,
    },
    {
      day: req.body.week_2_thu_date,
      time_on: req.body.week_2_thu_time_on,
      time_off: req.body.week_2_thu_time_off,
      reg_hours: req.body.week_2_thu_regular_hours,
      extra_hours: req.body.week_2_thu_extra_hours,
      vacation: req.body.week_2_thu_vacation_hours,
      unit: req.body.week_2_thu_unit,
      total: req.body.week_2_thu_total,
      date: req.body.week_2_thu_dateFull,
    },
    {
      day: req.body.week_2_fri_date,
      time_on: req.body.week_2_fri_time_on,
      time_off: req.body.week_2_fri_time_off,
      reg_hours: req.body.week_2_fri_regular_hours,
      extra_hours: req.body.week_2_fri_extra_hours,
      vacation: req.body.week_2_fri_vacation_hours,
      unit: req.body.week_2_fri_unit,
      total: req.body.week_2_fri_total,
      date: req.body.week_2_fri_dateFull,
    },
    {
      day: req.body.week_2_sat_date,
      time_on: req.body.week_2_sat_time_on,
      time_off: req.body.week_2_sat_time_off,
      reg_hours: req.body.week_2_sat_regular_hours,
      extra_hours: req.body.week_2_sat_extra_hours,
      vacation: req.body.week_2_sat_vacation_hours,
      unit: req.body.week_2_sat_unit,
      total: req.body.week_2_sat_total,
      date: req.body.week_2_sat_dateFull,
    },
  ];


  // FIX THIS to save flat rate stuff
 // saveTimesheet(employee_id, week_1_data, week_2_data, timesheet_data);

  req.session.last_timesheet = user.last_timesheet;
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
});

// Updates a timesheet.
router.post(
  "/update/",
  middlewares.restrictor,
  async function (req, res, next) {
    var payPeriodName = req.body.pay_period_name;
    var employee_name = req.body.employee_name;
    var employee_id = req.body.employee_id;
    var notes = req.body.notes;
    var explanation = req.body.explanation;
    var selectedBase = req.body.base;
    var timesheetId = req.params.id;

    var payPeriods = generatePayPeriods();
    var payPeriod = payPeriods.filter(function (period) {
      return period.name === payPeriodName;
    });
    payPeriod = payPeriod[0];

    var user = User.findById(parseInt(employee_id));

    var timesheet_data = [
      {
        payPeriod: payPeriod,
        payPeriodName: payPeriodName,
        employee_name: employee_name,
        notes: notes,
        explanation: explanation,
        selectedBase: selectedBase,
        userEmail: user.email,
      },
    ];

    var week_1_data = [
      {
        day: req.body.week_1_sun_date,
        time_on: req.body.week_1_sun_time_on,
        time_off: req.body.week_1_sun_time_off,
        reg_hours: req.body.week_1_sun_regular_hours,
        extra_hours: req.body.week_1_sun_extra_hours,
        vacation: req.body.week_1_sun_vacation_hours,
        unit: req.body.week_1_sun_unit,
        total: req.body.week_1_sun_total,
        date: req.body.week_1_sun_dateFull,
      },
      {
        day: req.body.week_1_mon_date,
        time_on: req.body.week_1_mon_time_on,
        time_off: req.body.week_1_mon_time_off,
        reg_hours: req.body.week_1_mon_regular_hours,
        extra_hours: req.body.week_1_mon_extra_hours,
        vacation: req.body.week_1_mon_vacation_hours,
        unit: req.body.week_1_mon_unit,
        total: req.body.week_1_mon_total,
        date: req.body.week_1_mon_dateFull,
      },
      {
        day: req.body.week_1_tue_date,
        time_on: req.body.week_1_tue_time_on,
        time_off: req.body.week_1_tue_time_off,
        reg_hours: req.body.week_1_tue_regular_hours,
        extra_hours: req.body.week_1_tue_extra_hours,
        vacation: req.body.week_1_tue_vacation_hours,
        unit: req.body.week_1_tue_unit,
        total: req.body.week_1_tue_total,
        date: req.body.week_1_tue_dateFull,
      },
      {
        day: req.body.week_1_wed_date,
        time_on: req.body.week_1_wed_time_on,
        time_off: req.body.week_1_wed_time_off,
        reg_hours: req.body.week_1_wed_regular_hours,
        extra_hours: req.body.week_1_wed_extra_hours,
        vacation: req.body.week_1_wed_vacation_hours,
        unit: req.body.week_1_wed_unit,
        total: req.body.week_1_wed_total,
        date: req.body.week_1_wed_dateFull,
      },
      {
        day: req.body.week_1_thu_date,
        time_on: req.body.week_1_thu_time_on,
        time_off: req.body.week_1_thu_time_off,
        reg_hours: req.body.week_1_thu_regular_hours,
        extra_hours: req.body.week_1_thu_extra_hours,
        vacation: req.body.week_1_thu_vacation_hours,
        unit: req.body.week_1_thu_unit,
        total: req.body.week_1_thu_total,
        date: req.body.week_1_thu_dateFull,
      },
      {
        day: req.body.week_1_fri_date,
        time_on: req.body.week_1_fri_time_on,
        time_off: req.body.week_1_fri_time_off,
        reg_hours: req.body.week_1_fri_regular_hours,
        extra_hours: req.body.week_1_fri_extra_hours,
        vacation: req.body.week_1_fri_vacation_hours,
        unit: req.body.week_1_fri_unit,
        total: req.body.week_1_fri_total,
        date: req.body.week_1_fri_dateFull,
      },
      {
        day: req.body.week_1_sat_date,
        time_on: req.body.week_1_sat_time_on,
        time_off: req.body.week_1_sat_time_off,
        reg_hours: req.body.week_1_sat_regular_hours,
        extra_hours: req.body.week_1_sat_extra_hours,
        vacation: req.body.week_1_sat_vacation_hours,
        unit: req.body.week_1_sat_unit,
        total: req.body.week_1_sat_total,
        date: req.body.week_1_sat_dateFull,
      },
    ];

    var week_2_data = [
      {
        day: req.body.week_2_sun_date,
        time_on: req.body.week_2_sun_time_on,
        time_off: req.body.week_2_sun_time_off,
        reg_hours: req.body.week_2_sun_regular_hours,
        extra_hours: req.body.week_2_sun_extra_hours,
        vacation: req.body.week_2_sun_vacation_hours,
        unit: req.body.week_2_sun_unit,
        total: req.body.week_2_sun_total,
        date: req.body.week_2_sun_dateFull,
      },
      {
        day: req.body.week_2_mon_date,
        time_on: req.body.week_2_mon_time_on,
        time_off: req.body.week_2_mon_time_off,
        reg_hours: req.body.week_2_mon_regular_hours,
        extra_hours: req.body.week_2_mon_extra_hours,
        vacation: req.body.week_2_mon_vacation_hours,
        unit: req.body.week_2_mon_unit,
        total: req.body.week_2_mon_total,
        date: req.body.week_2_mon_dateFull,
      },
      {
        day: req.body.week_2_tue_date,
        time_on: req.body.week_2_tue_time_on,
        time_off: req.body.week_2_tue_time_off,
        reg_hours: req.body.week_2_tue_regular_hours,
        extra_hours: req.body.week_2_tue_extra_hours,
        vacation: req.body.week_2_tue_vacation_hours,
        unit: req.body.week_2_tue_unit,
        total: req.body.week_2_tue_total,
        date: req.body.week_2_tue_dateFull,
      },
      {
        day: req.body.week_2_wed_date,
        time_on: req.body.week_2_wed_time_on,
        time_off: req.body.week_2_wed_time_off,
        reg_hours: req.body.week_2_wed_regular_hours,
        extra_hours: req.body.week_2_wed_extra_hours,
        vacation: req.body.week_2_wed_vacation_hours,
        unit: req.body.week_2_wed_unit,
        total: req.body.week_2_wed_total,
        date: req.body.week_2_wed_dateFull,
      },
      {
        day: req.body.week_2_thu_date,
        time_on: req.body.week_2_thu_time_on,
        time_off: req.body.week_2_thu_time_off,
        reg_hours: req.body.week_2_thu_regular_hours,
        extra_hours: req.body.week_2_thu_extra_hours,
        vacation: req.body.week_2_thu_vacation_hours,
        unit: req.body.week_2_thu_unit,
        total: req.body.week_2_thu_total,
        date: req.body.week_2_thu_dateFull,
      },
      {
        day: req.body.week_2_fri_date,
        time_on: req.body.week_2_fri_time_on,
        time_off: req.body.week_2_fri_time_off,
        reg_hours: req.body.week_2_fri_regular_hours,
        extra_hours: req.body.week_2_fri_extra_hours,
        vacation: req.body.week_2_fri_vacation_hours,
        unit: req.body.week_2_fri_unit,
        total: req.body.week_2_fri_total,
        date: req.body.week_2_fri_dateFull,
      },
      {
        day: req.body.week_2_sat_date,
        time_on: req.body.week_2_sat_time_on,
        time_off: req.body.week_2_sat_time_off,
        reg_hours: req.body.week_2_sat_regular_hours,
        extra_hours: req.body.week_2_sat_extra_hours,
        vacation: req.body.week_2_sat_vacation_hours,
        unit: req.body.week_2_sat_unit,
        total: req.body.week_2_sat_total,
        date: req.body.week_2_sat_dateFull,
      },
    ];

    updateTimesheet(
      timesheetId,
      employee_id,
      week_1_data,
      week_2_data,
      timesheet_data,
      true
    );

    req.session.last_timesheet = user.last_timesheet;
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
  }
);

// Generates a PDF document for the employee
const generatePDF = (
  employee_name,
  payPeriodName,
  week_1_data,
  week_2_data,
  flatRateItems,
  explanationItems,
  showFlatRateItems,
  showExplanationItems,
  res
) => {
  try {
    const doc = new PDFDocument();
    //const stream = doc.pipe(blobStream());

    doc.fontSize(12).text("Employee: " + employee_name, 60, 15);
    doc.fontSize(12).text("Pay Period: " + payPeriodName, 60, 30);

    // Week 1 table
    doc.fontSize(12).text("Week 1", { underline: true });
    doc.moveDown();
    doc.table({
      headers: [
        "Day",
        "Time On",
        "Time Off",
        "Regular Hours",
        "Other Hours",
        "Vacation Hours",
        "Unit",
        "Total",
      ],
      rows: week_1_data.map((data) => [
        data.day,
        data.time_on,
        data.time_off,
        data.reg_hours || 0,
        data.extra_hours || 0,
        data.vacation || 0,
        data.unit,
        data.total || 0,
      ]),
    });

    // Week 2 table
    doc.fontSize(12).text("Week 2", { underline: true });
    doc.moveDown();
    doc.table({
      headers: [
        "Day",
        "Time On",
        "Time Off",
        "Regular Hours",
        "Other Hours",
        "Vacation Hours",
        "Unit",
        "Total",
      ],
      rows: week_2_data.map((data) => [
        data.day,
        data.time_on,
        data.time_off,
        data.reg_hours || 0,
        data.extra_hours || 0,
        data.vacation || 0,
        data.unit,
        data.total || 0,
      ]),
    });
/*
    let week_1_regular_hours_total = 0;
    let week_1_overtime_hours = 0;
    let week_2_regular_hours_total = 0;
    let week_2_overtime_hours = 0;

    week_1_data.forEach((data) => {
      const regHours = parseFloat(data.reg_hours || 0);
      const totalHours = parseFloat(data.total || 0).toFixed(2);
  
      if (week_1_regular_hours_total + totalHours <= 40) {
        week_1_regular_hours_total += totalHours;
      } else {
        week_1_overtime_hours += totalHours - 40 + week_1_regular_hours_total;
        week_1_regular_hours_total = 40;
      }
    });

    week_2_data.forEach((data) => {
      const regHours = parseFloat(data.reg_hours || 0);
      const totalHours = parseFloat(data.total || 0).toFixed(2);
  
      if (week_2_regular_hours_total + totalHours <= 40) {
        week_2_regular_hours_total += totalHours;
      } else {
        week_2_overtime_hours += totalHours - 40 + week_2_regular_hours_total;
        week_2_regular_hours_total = 40;
      }
    });*/

    let week_1_regular_hours_total = 0;
    let week_1_overtime_hours = 0;
    let week_2_regular_hours_total = 0;
    let week_2_overtime_hours = 0;

  week_1_data.forEach((data) => {
    const regHours = parseFloat(data.reg_hours || 0);
    const totalHours = parseFloat(data.total || 0).toFixed(2);

    if (week_1_regular_hours_total + parseFloat(totalHours) <= 40) {
      week_1_regular_hours_total += parseFloat(totalHours);
    } else {
      const overtime = parseFloat(totalHours) - (40 - week_1_regular_hours_total);
      week_1_overtime_hours += overtime;
      week_1_regular_hours_total = 40;
    }
  });

  week_2_data.forEach((data) => {
    const regHours = parseFloat(data.reg_hours || 0);
    const totalHours = parseFloat(data.total || 0).toFixed(2);

    if (week_2_regular_hours_total + parseFloat(totalHours) <= 40) {
      week_2_regular_hours_total += parseFloat(totalHours);
    } else {
      const overtime = parseFloat(totalHours) - (40 - week_2_regular_hours_total);
      week_2_overtime_hours += overtime;
      week_2_regular_hours_total = 40;
    }
  });
    
    // Calculate vacation hours total
    const vacation_hours_total = week_1_data.reduce(
      (total, data) => total + parseFloat(data.vacation || 0),
      0
    ) + week_2_data.reduce(
      (total, data) => total + parseFloat(data.vacation || 0),
      0
    );
    
    // Calculate holiday hours total
    const holiday_hours_total = week_1_data.reduce(
      (total, data) => total + parseFloat(data.holiday || 0),
      0
    ) + week_2_data.reduce(
      (total, data) => total + parseFloat(data.holiday || 0),
      0
    );
      
      // Calculate Flat Rate items row count and table
      let fr_row_count = 0;
      const flatRateTable = {
      title: "Flat Rate Items",
      headers: ["Description", "Unit", "Total"],
      rows: flatRateItems.map((item) => [
        item.description,
        item.unit,
        item.total,
      ]),
      };
      
      // Calculate Explanation items table
      const explanationTable = {
      title: "Explanation",
      headers: ["Description"],
      rows: explanationItems.map((item) => [item.description]),
      };
      
      // Add Flat Rate and Explanation items tables if requested
      if (showFlatRateItems) {
        doc.fontSize(12).text("Flat Rate Items", { underline: true });
        doc.table({
          headers: ["Date", "Time On", "Time Off", "Run Number", "Explanation"],
          rows: flatRateItems.map((item) => [item.date, item.time_on, item.time_off, item.run_number, item.explanation]),
        });
      } else {
        console.log("Table creation: Flat Rate Items table not created.");
      }

      if (showExplanationItems) {
        doc.fontSize(12).text("Explanation Items", { underline: true });
        doc.table({
          headers: ["Date", "Time On", "Time Off", "Run Number", "Explanation"],
          rows: explanationItems.map((item) => [item.date, item.time_on, item.time_off, item.run_number, item.explanation]),
        });
      }
      
      // Create total table
      const totalTable = {
        title: "Totals",
        headers: [
          "Week 1 Regular",
          "Week 1 OT",
          "Week 2 Regular",
          "Week 2 OT",
          "Vacation",
          "Holiday",
          "Flat Rate",
        ],
        rows: [
          [
            week_1_regular_hours_total,
            parseFloat(week_1_overtime_hours).toFixed(2),
            week_2_regular_hours_total,
            parseFloat(week_2_overtime_hours).toFixed(2),
            vacation_hours_total,
            holiday_hours_total,
            fr_row_count,
          ],
        ],
      };
      
      doc.table(totalTable, {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
      prepareRow: (row, i) => doc.font("Helvetica").fontSize(8),
      });

    const randomNum = Math.floor(Math.random() * 888) + 111;
    const sanitizedEmployeeName = employee_name.replace(/[/\\?%*:|"<>]/g, '-');
    const fileName = `${sanitizedEmployeeName}_${randomNum}.pdf`;
    const filePath = path.join(__dirname, "../public/timesheets", sanitizedEmployeeName, fileName);

    // Create directory if it doesn't exist
    const dirPath = path.join(__dirname, "../public/timesheets", sanitizedEmployeeName);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, {recursive: true});
    }

    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);
    doc.end();

    // Set the file download URL
    const fileDownloadUrl = `/timesheets/${sanitizedEmployeeName}/${fileName}`;

    // Redirect the user to the file download URL
    res.redirect(fileDownloadUrl);

  } catch (error){
    console.error(error);
    res.status(500).send("Error generating PDF.");
  }

};

// Save the PDF to a file.
async function saveAs(blob, filename, res) {
  const buffer = Buffer.from(await blob.arrayBuffer());
  const blobStream = new stream.PassThrough();
  blobStream.end(buffer);
  res.writeHead(200, {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Content-Length": Buffer.byteLength(buffer),
  });
  blobStream.pipe(res);
}

module.exports = router;
