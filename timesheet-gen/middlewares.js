

var devOverride = process.env.NODE_ENV === "dev";

module.exports = {
  // Restricts the current user.
  restrictor: function restrict(req, res, next) {
    if (req.session.loggedin) {
      next();
    } else {
      req.session.error = "Access denied!";
      res.redirect("/");
    }
  },
};
