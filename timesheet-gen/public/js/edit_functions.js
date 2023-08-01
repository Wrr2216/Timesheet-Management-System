function disablePayPeriodSelection() {
  var payPeriodSelect = document.getElementById('pay_period');
  payPeriodSelect.disabled = true;
  var selectedPayPeriod = payPeriodSelect.value;
  var payPeriodNameInput = document.querySelector('input[name="pay_period_name"]');
  payPeriodNameInput.value = selectedPayPeriod;
}

window.addEventListener('DOMContentLoaded', function() {
  disablePayPeriodSelection();

  var form = document.querySelector('form');
  form.addEventListener('submit', function(event) {
      event.preventDefault(); // Prevent default form submission behavior

      //updateTimesheet(); // Call the updateTimesheet() function

      // Manually submit the form
      form.submit();
  });



  // Call addFlatRateRow() for each flatRateItem

});

function updateTimesheet(tId) {
  console.log('*********** Update timesheet function');
  if (!tId) {
      console.log('Invalid timesheet ID');
      return false;
  }

  var deleteUrl = '/timesheets/delete/' + tId;
  console.log('URL to delete timesheet: ' + deleteUrl);

  fetch(deleteUrl, {
      method: 'POST',
  })
      .then(function (response) {
          if (response.ok) {
              // Handle successful deletion
              console.log('Timesheet deleted successfully');
              // Perform any additional actions or redirect if needed
          } else {
              // Handle error response
              console.log('Failed to delete timesheet');
              // Handle the error case, display a message, or take appropriate action
          }
      })
      .catch(function (error) {
          // Handle network or fetch() related errors
          console.log('Error occurred while deleting timesheet:', error);
      });

  return true;
}

// addFlatRateRow(time.date, time.timeOn, time.timeOff, time.runNumber, time.explaination);
var flatRateRows = 0;
function addFlatRateRow(date, timeOn, timeOff, runNumber, explaination) {
  if (flatRateRows == 0) {
    addDividerRow("flatrate");
  }

  flatRateRows++;

  var row = "<tr id='fr-row' class='flatrate_row'>";
  row += "<td style='color: red'>Item " + (flatRateRows - 1) + "</td>";
  row +=
    "<td><input type='date' name='fr_date_" +
    (flatRateRows - 1) +
    "' placeholder='01/01/2023' value='"+date+"'></td>";
  row +=
    "<td><input type='number' name='fr_time_on_" +
    (flatRateRows - 1) +
    "' placeholder='Time On' value='"+timeOn+"'></td>";
  row +=
    "<td><input type='number' name='fr_time_off_" +
    (flatRateRows - 1) +
    "' placeholder='Time Off' value='"+timeOff+"'></td>";
  row +=
    "<td><input type='text' name='fr_run_number_" +
    (flatRateRows - 1) +
    "' placeholder='Run Number' value='"+runNumber+"'></td>";
  row +=
    "<td><input type='text' name='fr_explaination_" +
    (flatRateRows - 1) +
    "' placeholder='Explanation' value='"+explaination+"'></td>";
  row +=
    "<td><input type='hidden' name='fr_row_" + (flatRateRows - 1) + "'></td>";
  row +=
    "<td><button type='button' class='btn btn-danger' onclick='deleteRow(this)'>Delete</button></td>";
  row += "</tr>";
  $("tbody").append(row);

  $("input[name='fr_row_count']").val(flatRateRows).trigger("change");
}

var expRows = 0;
function addExplRow(date, timeOn, timeOff, runNumber, explaination) {
  if (expRows == 0) {
    addDividerRow("explanation");
  }

  expRows++;

  var row = "<tr id='exp-row' class='exp_row'>";
  row += "<td style='color: red'>Item " + (expRows - 1) + "</td>";
  row +=
    "<td><input type='date' name='exp_date_" +
    (expRows - 1) +
    "' placeholder='01/01/2023' required value='"+date+"'></td>";
  row +=
    "<td><input type='number' name='exp_time_on_" +
    (expRows - 1) +
    "' placeholder='Time On' value='"+timeOn+"'></td>";
  row +=
    "<td><input type='number' name='exp_time_off_" +
    (expRows - 1) +
    "' placeholder='Time Off' value='"+timeOff+"'></td>";
  row +=
    "<td><input type='text' name='exp_run_number_" +
    (expRows - 1) +
    "' placeholder='Run Number' required value='"+runNumber+"'></td>";
  row +=
    "<td><input type='text' name='exp_explaination_" +
    (expRows - 1) +
    "' placeholder='Explanation' required value='"+explaination+"'></td>";
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

function blankFlatRateRows() {
  $(".flatrate_row").remove();
}

function blankExplanationRows() {
  $(".exp_row").remove();
}

function saveTimesheet() {
  var form = document.querySelector("form");

  form.action = "/timesheets/save/";
  form.method = "POST";

  form.submit();
}

function updateTimesheet(){
  var form = document.querySelector("form");

  form.action = "/timesheets/update/";
  form.method = "POST";

  form.submit();
}