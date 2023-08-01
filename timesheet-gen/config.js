var config = {};
config.email = {};
config.sql = {};

/* Use these if for environment variables. Highly recommend.
config.email.service = process.env.EMAIL_SERVICE;
config.email.username = process.env.EMAIL_USER;
config.email.password = process.env.EMAIL_PASS;
config.email.destination = process.env.EMAIL_DEST;
config.email.bcc = process.env.EMAIL_BCC;
config.email.from = process.env.EMAIL_FROM;

config.sql.host = process.env.SQL_HOST;
config.sql.user = process.env.SQL_USER;
config.sql.password = process.env.SQL_PASS;
config.sql.database = process.env.SQL_DB;
*/

// Hard coded credentials
config.email.service = "Gmail";
config.email.username = "sampleuser@gmail.com";
config.email.password = "password";
config.email.destination = "timesheet-destinationemail@gmail.com";
config.email.bcc = "";
config.email.from = "company-website@gmail.com";

config.sql.host = "db-ip";
config.sql.user = "db-user";
config.sql.password = "db-pass";
config.sql.database = "db";

module.exports = config;
