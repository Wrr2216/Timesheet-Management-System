$(document).ready(function () {
  //calculateRegHours();
  //calculateTotalHours();
  updateDateFields();

  $(window).keydown(function(event){
    if(event.keyCode == 13) {
      event.preventDefault();
      return false;
    }
  });
});




/**
 * Sets the default selected pay period to the current pay period.
 * @param {PayPeriod[]} payPeriods - the array of pay periods.
 * @returns None
 */
function updateDateFields() {
  var bases = generateBases();
  var payPeriods = generatePayPeriods();
  $("#pay_period").on("change", function () {
    var selectedPayPeriod = $("#pay_period option:selected").val();

    var payPeriod = payPeriods.filter(function (period) {
      return period.name === selectedPayPeriod;
    });
    payPeriod = payPeriod[0];

    // Set the hidden input field so we can transfer the pay period to the pdf.
    $("input[name='pay_period_name']").val(payPeriod.name).trigger("change");

    // Remove existing table rows
    $("tbody tr").remove();

    // Create new table rows with updated dates
    for (var i = 0; i < 14; i++) {
      var date = new Date(payPeriod.start);
      date.setDate(date.getDate() + i);
      var day = date.toString().substr(0, 3);
      var formattedDate =
        day + " - " + (date.getMonth() + 1) + "/" + date.getDate();
      var fullDate =
        date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
      var week = i < 7 ? "week_1" : "week_2";
      var holiday = isHoliday(new Date(fullDate));
      var dateStr = day + " - " + (date.getMonth() + 1) + "/" + date.getDate();

      var hiddenDate =
        "<input type='hidden' name='" +
        week +
        "_" +
        day.toLowerCase() +
        "_date' value='" +
        dateStr +
        "'>";
      $("input[name='" + week + "_" + day.toLowerCase() + "_date']")
        .replaceWith(hiddenDate)
        .trigger("change");

      var row = "<tr>";
      if (holiday == true) {
        row += "<td style='color: red;'>" + formattedDate + "</td>";
      } else {
        row += "<td>" + formattedDate + "</td>";
      }
      row +=
        "<td><input type='number' name='" +
        week +
        "_" +
        day.toLowerCase() +
        "_time_on' placeholder='Time On'></td>";
      row +=
        "<td><input type='number' name='" +
        week +
        "_" +
        day.toLowerCase() +
        "_time_off' placeholder='Time Off'></td>";
      row +=
        "<td><input type='number' min=0 max=24 step='0.01' name='" +
        week +
        "_" +
        day.toLowerCase() +
        "_regular_hours' placeholder='Regular Hours' value=0></td>";
      row +=
        "<td><input type='number' min=0 max=24 step='0.01' name='" +
        week +
        "_" +
        day.toLowerCase() +
        "_extra_hours' placeholder='Extra Hours' value=0></td>";
      row +=
        "<td><input type='number' min=0 max=24 step='0.01' name='" +
        week +
        "_" +
        day.toLowerCase() +
        "_vacation_hours' placeholder='Vacation Hours' value=0></td>";
      row +=
        "<td><input type='number' name='" +
        week +
        "_" +
        day.toLowerCase() +
        "_unit' placeholder='Unit'></td>";
      row +=
        "<td><input type='number' min=0 max=24 step='0.01' name='" +
        week +
        "_" +
        day.toLowerCase() +
        "_total' placeholder='Total Hours' value=0></td>";
      row += "</tr>";
      $("tbody").append(row);
    }

    //calculateRegHours();
    //calculateTotalHours();
  });

  defaultSelectedPayPeriod(payPeriods);
}

var flatRateRows = 0;
/**
 * Adds a flat rate row to the table.
 * @returns None
 */
function addFlatRateRow() {
  if (flatRateRows == 0) {
    addDividerRow("flatrate");
  }

  flatRateRows++;

  var row = "<tr id='fr-row' class='flatrate_row'>";
  row += "<td style='color: red'>Item " + (flatRateRows - 1) + "</td>";
  row +=
    "<td><input type='date' name='fr_date_" +
    (flatRateRows - 1) +
    "' placeholder='01/01/2023'></td>";
  row +=
    "<td><input type='number' name='fr_time_on_" +
    (flatRateRows - 1) +
    "' placeholder='Time On'></td>";
  row +=
    "<td><input type='number' name='fr_time_off_" +
    (flatRateRows - 1) +
    "' placeholder='Time Off'></td>";
  row +=
    "<td><input type='text' name='fr_run_number_" +
    (flatRateRows - 1) +
    "' placeholder='Run Number'></td>";
  row +=
    "<td><input type='text' name='fr_explaination_" +
    (flatRateRows - 1) +
    "' placeholder='Explanation'></td>";
  row +=
    "<td><input type='hidden' name='fr_row_" + (flatRateRows - 1) + "'></td>";
  row +=
    "<td><button type='button' class='btn btn-danger' onclick='deleteRow(this)'>Delete</button></td>";
  row += "</tr>";
  $("tbody").append(row);

  $("input[name='fr_row_count']").val(flatRateRows).trigger("change");
}

var expRows = 0;
function addExplRow() {
  if (expRows == 0) {
    addDividerRow("explanation");
  }

  expRows++;

  var row = "<tr id='exp-row' class='exp_row'>";
  row += "<td style='color: red'>Item " + (expRows - 1) + "</td>";
  row +=
    "<td><input type='date' name='exp_date_" +
    (expRows - 1) +
    "' placeholder='01/01/2023' required></td>";
  row +=
    "<td><input type='number' name='exp_time_on_" +
    (expRows - 1) +
    "' placeholder='Time On'></td>";
  row +=
    "<td><input type='number' name='exp_time_off_" +
    (expRows - 1) +
    "' placeholder='Time Off'></td>";
  row +=
    "<td><input type='text' name='exp_run_number_" +
    (expRows - 1) +
    "' placeholder='Run Number' required></td>";
  row +=
    "<td><input type='text' name='exp_explaination_" +
    (expRows - 1) +
    "' placeholder='Explanation' required></td>";
  row += "<td><input type='hidden' name='exp_row_" + (expRows - 1) + "'></td>";
  row +=
    "<td><button type='button' class='btn btn-danger' onclick='deleteRow(this)'>Delete</button></td>";
  row += "</tr>";
  $("tbody").append(row);

  $("input[name='exp_row_count']").val(expRows).trigger("change");
}

function deleteRow(row) {
  var row = $(row).closest("tr");
  row.remove();

  //if it is the last row, delete the header too
  if ($("tr").length == 1) {
    $("tr").remove();
  }

  //if it is a flat rate row, decrease the flat rate row count
  if (row.hasClass("flatrate_row")) {
    flatRateRows--;
    $("input[name='fr_row_count']").val(flatRateRows).trigger("change");
  }

  //if it is an explanation row, decrease the explanation row count
  if (row.hasClass("exp_row")) {
    expRows--;
    $("input[name='exp_row_count']").val(expRows).trigger("change");
  }
}

/**
 * Adds a row to the flat rate table.
 * @returns None
 */
function addDividerRow(type) {
  if (type == "flatrate") {
    var row = "<tr>";
    row += "<td style='color: red'>Flat Rate Pay</td>";
    row += "<td style='color: red'>Date</td>";
    row += "<td style='color: red'>Time On</td>";
    row += "<td style='color: red'>Time Off</td>";
    row += "<td style='color: red'>Run Number</td>";
    row += "<td style='color: red'>Explanation</td>";
    row += "<td style='color: red'> N/A </td>";
    row +=
      "<td><input type='hidden' name='fr_row_count' value=" +
      flatRateRows +
      "></td>";
    row += "</tr>";
    $("tbody").append(row);
  } else if (type == "explanation") {
    var row = "<tr>";
    row += "<td style='color: red'>Explain other hours</td>";
    row += "<td style='color: red'>Date</td>";
    row += "<td style='color: red'>Time On</td>";
    row += "<td style='color: red'>Time Off</td>";
    row += "<td style='color: red'>Run Number</td>";
    row += "<td style='color: red'>Explanation</td>";
    row += "<td style='color: red'> N/A </td>";
    row +=
      "<td><input type='hidden' name='exp_row_count' value=" +
      expRows +
      "></td>";
    row += "</tr>";
    $("tbody").append(row);
  }
}

/**
 * Removes all flat rate rows from the page.
 * @returns None
 */
function blankFlatRateRows() {
  $(".flatrate_row").remove();
}

function blankExplanationRows() {
  $(".exp_row").remove();
}

/**
 * Generates the fields for the timesheet.
 * @param {Timesheet} timesheet - the timesheet object
 * @returns None
 */
function generateFields(timesheet) {
  var bases = generateBases();
  var payPeriods = generatePayPeriods();
  var selectedPayPeriod = timesheet[14].payPeriod.start;

  var payPeriod = payPeriods.filter(function (period) {
    return period.name === selectedPayPeriod;
  });
  payPeriod = payPeriod[0];

  // Set the hidden input field so we can transfer the pay period to the pdf.
  $("input[name='pay_period_name']").val(payPeriod.name).trigger("change");

  // Remove existing table rows
  $("tbody tr").remove();

  // Create new table rows with updated dates
  for (var i = 0; i < 14; i++) {
    var date = new Date(timesheet[14].payPeriod.start);
    date.setDate(date.getDate() + i);
    var day = date.toString().substr(0, 3);
    var formattedDate =
      day + " - " + (date.getMonth() + 1) + "/" + date.getDate();
    var fullDate =
      date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
    var week = i < 7 ? "week_1" : "week_2";
    var holiday = isHoliday(new Date(fullDate));
    var dateStr = day + " - " + (date.getMonth() + 1) + "/" + date.getDate();

    var hiddenDate =
      "<input type='hidden' name='" +
      week +
      "_" +
      day.toLowerCase() +
      "_date' value='1111" +
      dateStr +
      "'>";
    $("input[name='" + week + "_" + day.toLowerCase() + "_date']").remove();

    // If this does not work lets append to tbody $("tbody").append(hiddenDate);
    $("tbody").append(hiddenDate);
    var row = "<tr>";
    if (holiday == true) {
      row += "<td style='color: red;'>" + formattedDate + "</td>";
    } else {
      row += "<td>" + formattedDate + "</td>";
    }
    row +=
      "<td><input type='number' step='0.01' name='" +
      week +
      "_" +
      day.toLowerCase() +
      "_time_on' placeholder='Time On'></td>";
    row +=
      "<td><input type='number' step='0.01' name='" +
      week +
      "_" +
      day.toLowerCase() +
      "_time_off' placeholder='Time Off'></td>";
    row +=
      "<td><input type='number' min=0 max=24 step='0.01' name='" +
      week +
      "_" +
      day.toLowerCase() +
      "_regular_hours' placeholder='Regular Hours' value=0></td>";
    row +=
      "<td><input type='number' min=0 max=24 step='0.01' name='" +
      week +
      "_" +
      day.toLowerCase() +
      "_extra_hours' placeholder='Extra Hours' value=0></td>";
    row +=
      "<td><input type='number' min=0 max=24 step='0.01' name='" +
      week +
      "_" +
      day.toLowerCase() +
      "_vacation_hours' placeholder='Vacation Hours' step='0.01' value=0></td>";
    row +=
      "<td><input type='text' name='" +
      week +
      "_" +
      day.toLowerCase() +
      "_unit' placeholder='Unit'></td>";
    row +=
      "<td><input type='number' min=0 max=24 step='0.01' name='" +
      week +
      "_" +
      day.toLowerCase() +
      "_total' placeholder='Total Hours' value=0></td>";
    row += "</tr>";
    $("tbody").append(row);
  }
  //calculateRegHours();
  //calculateTotalHours();
}

/**
 * Finds the current pay period and selects it in the dropdown menu.
 * @param {PayPeriod[]} payPeriods - the list of pay periods to search
 */
function defaultSelectedPayPeriod(payPeriods) {
  var currentDate = new Date();
  for (var i = 0; i < payPeriods.length; i++) {
    var start = new Date(payPeriods[i].start);
    var end = new Date(payPeriods[i].end);
    if (currentDate >= start && currentDate <= end) {
      $("#pay_period").val(payPeriods[i].name).trigger("change");
      break;
    }
  }
}

/**
 * Generates a list of pay periods.
 * @returns {PayPeriod[]} - A list of pay periods.
 */
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

/**
 * Calculates the regular hours worked for each day of the week.
 * @returns None
 */
function calculateRegHours() {
  var weeks = [1, 2];
  var days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

  weeks.forEach(function (weeks) {
    days.forEach(function (day) {
      var start_time = $(
        'input[name$="week_' + weeks + "_" + day + '_time_on"]'
      ).val();
      var end_time = $(
        'input[name$="week_' + weeks + "_" + day + '_time_off"]'
      ).val();

      $(
        'input[name$="week_' +
          weeks +
          "_" +
          day +
          '_time_on"], input[name$="week_' +
          weeks +
          "_" +
          day +
          '_time_off"]'
      ).on("change", function () {
        var start_time = $(
          'input[name$="week_' + weeks + "_" + day + '_time_on"]'
        ).val();
        var end_time = $(
          'input[name$="week_' + weeks + "_" + day + '_time_off"]'
        ).val();

        var startDate = new Date();
        startDate.setHours(start_time.substring(0, 2));
        startDate.setMinutes(start_time.substring(2, 4));

        var endDate = new Date();
        endDate.setDate(startDate.getDate());
        endDate.setHours(end_time.substring(0, 2));
        endDate.setMinutes(end_time.substring(2, 4));

        var diff = endDate.getTime() - startDate.getTime();

        if (diff < 1 && start_time == "0700" && end_time == "0700") {
          diff = 86400000;
        } else if (diff < 0) {
          diff += 86400000;
        }

        var hoursWorked = diff / (1000 * 60 * 60);
        $('input[name$="week_' + weeks + "_" + day + '_regular_hours"]')
          .val(hoursWorked)
          .trigger("change");
      });
    });
  });
}

// Found on https://stackoverflow.com/questions/68943673/js-check-for-holidays
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

function calculateTotalHours() {
  const weeks = [1, 2];
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

  weeks.forEach((week) => {
    days.forEach((day) => {
      const regularHoursInput = $(
        `input[name$="week_${week}_${day}_regular_hours"]`
      );
      const extraHoursInput = $(
        `input[name$="week_${week}_${day}_extra_hours"]`
      );
      const vacationHoursInput = $(
        `input[name$="week_${week}_${day}_vacation_hours"]`
      );

      [regularHoursInput, extraHoursInput, vacationHoursInput].forEach(
        (input) => {
          input.on("change", () => {
            const regularHours = parseFloat(regularHoursInput.val());
            const extraHours = parseFloat(extraHoursInput.val());
            const vacationHours = parseFloat(vacationHoursInput.val());

            // If value is empty string or NaN, set to 0.
            if (isNaN(regularHours)) {
              regularHoursInput.val(0);
            }
            if (isNaN(extraHours)) {
              extraHoursInput.val(0);
            }
            if (isNaN(vacationHours)) {
              vacationHoursInput.val(0);
            }

            // Only add regular hours. Extra hours and vacation hours are added in the total hours calculation.
            let total = regularHours;

            if (total > 24) {
              total = 24;
              alert("You can't work more than 24 hours in a day!");
            }

            $(`input[name$="week_${week}_${day}_total"]`).val(total);
          });
        }
      );
    });
  });
}

function saveTimesheet() {
  var form = document.querySelector("form");

  form.action = "/timesheets/save/";
  form.method = "POST";

  form.submit();
}

function updateTable() {
  var select = document.getElementById("payPeriodList");
  var selectedPayPeriod = select.value;

  var tableRows = document.getElementsByTagName("tr");
  for (var i = 1; i < tableRows.length; i++) {
    var payPeriodName = tableRows[i].getElementsByTagName("td")[1].textContent;

    if (selectedPayPeriod === "" || payPeriodName === selectedPayPeriod) {
      tableRows[i].style.display = "";
    } else {
      tableRows[i].style.display = "none";
    }
  }
}

function exportReport() {
  // Find all visible rows
  var tableRows = document.getElementsByTagName("tr");
  var visibleRows = [];
  for (var i = 1; i < tableRows.length; i++) {
    if (tableRows[i].style.display !== "none") {
      visibleRows.push(tableRows[i]);
    }
  }

  // Create CSV from table
  var csv = [];
  var rows = visibleRows;
  for (var i = 0; i < rows.length; i++) {
    var row = [],
      cols = rows[i].querySelectorAll(
        "td:not(:last-child):not(:nth-last-child(2)), th:not(:last-child):not(:nth-last-child(2))"
      );

    for (var j = 0; j < cols.length; j++) row.push(cols[j].innerText);

    csv.push(row.join(","));
  }

  // Download CSV
  var csvString = csv.join("%0A");
  var a = document.createElement("a");
  a.href = "data:attachment/csv," + csvString;
  a.target = "_Blank";
  a.download = "report.csv";
  document.body.appendChild(a);
  a.click();
}

function downloadSingleTimesheet() {}

const generatePDF = (
  employee_name,
  payPeriodName,
  week_1_data,
  week_2_data,
  flatRateItems,
  explanationItems
) => {
  const doc = new PDFDocument();
  const stream = doc.pipe(blobStream());

  doc.fontSize(12).text("Employee: " + employee_name, 60, 15);
  doc.fontSize(12).text("Pay Period: " + payPeriodName, 60, 30);

  // Week 1 table
  doc.moveDown();
  doc.addPage();
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
  doc.addPage();
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

  // Flat rate items table
  if (flatRateItems.rows.length > 0) {
    doc.addPage();
    doc.fontSize(12).text(flatRateItems.title, { underline: true });
    doc.moveDown();
    doc.table({
      headers: ["Item", "Quantity", "Unit Price", "Total"],
      rows: flatRateItems.rows.map((row) => [
        row.item,
        row.quantity,
        row.unit_price,
        row.total,
      ]),
    });
  }

  // Explanation items table
  if (explanationItems.rows.length > 0) {
    doc.addPage();
    doc.fontSize(12).text(explanationItems.title, { underline: true });
    doc.moveDown();
    doc.table({
      headers: ["Item", "Amount"],
      rows: explanationItems.rows.map((row) => [row.item, row.amount]),
    });
  }

  doc.end();
  stream.on("finish", function () {
    const blob = stream.toBlob("application/pdf");
    saveAs(blob, employee_name + "_" + payPeriodName + ".pdf");
  });
};

function submitTimesheet() {
  const confirmed = confirm("Are you sure you want to submit?");

  if (!validateForm()) {
    return false;
  }

  if (confirmed) {
    //window.alert("Timesheet submitted successfully!");
    var form = $('form');
    form.submit();
    setTimeout(function() {
      window.location.href = "/user/timesheets";
    }, 1000);
  }
}

function validateForm(){
  var payPeriods = generatePayPeriods();
  var payPeriod = $("#pay_period option:selected").val();
  var name = $("input[name='employee_name']").val();
  var base = $("input[name='base_selection']").val();
  var isValid = true;

  if(name === ""){
    window.alert("Please enter a valid name. Name -> " + name);
    isValid = false;
  }

  if(base === ""){
    window.alert("Please enter a valid base.");
    isValid = false;
  }

  if(payPeriod === ""){
    window.alert("Please select a valid pay period.");
    isValid = false;
  }

  // Check if all number inputs contain a valid number or are empty. If they are empty set them to 0.
  var tableRows = $("tbody tr");

  // Loop through each row
  tableRows.each(function() {
    // Get the inputs in the current row
    var inputs = $(this).find("input[type='number']").not("[name*='_time_on']").not("[name*='_time_off']").not("[name*='_unit']");
    
    // Loop through each input in the row
    inputs.each(function() {
      // Check if the input value is empty
      if ($(this).val() === "") {
        // Set the input value to 0
        $(this).val(0);
      }
    });
  });

  var selectedPayPeriod = $("#pay_period option:selected").val();
  var payPeriod = payPeriods.find(function(period){
    return period.name === selectedPayPeriod;
  });

  for(var i = 0; i < 14; i++){
    var date = new Date(payPeriod.start);
    date.setDate(date.getDate() + i);
    var day = date.toString().substring(0, 3);
    var formattedDate = day + " - " + (date.getMonth() + 1) + "/" + date.getDate();
    var fullDate = date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
    var week = i < 7 ? "week_1" : "week_2";
    var holiday = isHoliday(new Date(fullDate));
    var dateStr = day + " - " + (date.getMonth() + 1) + "/" + date.getDate();
      
    console.log("Date: " + dateStr + " Holiday: " + holiday + " Week: " + week + " Day: " + day);
  
    // E.g. week_1_sun_regular_hours
    var regHours = $("input[name='" + week + "_" + day.toLowerCase() + "_regular_hours']").val();
    var otherHours = $("input[name='" + week + "_" + day.toLowerCase() + "_extra_hours']").val();
    var totalHours = $("input[name='" + week + "_" + day.toLowerCase() + "_total']").val();
  
    if(regHours > 0 || otherHours > 0){
      var totalInput = $("input[name='" + week + "_" + day.toLowerCase() + "_total']");
      totalInput.attr("required", "true");
  
      if(totalHours == 0 || isNaN(totalHours) || totalHours == null || totalHours == ""){
        totalInput.css("border", "1px solid red");
        isValid = false;
      }else{
        totalInput.css("border", "");
      }
    }
  }
  
  return isValid !== false;
}
