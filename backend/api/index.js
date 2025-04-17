const addon = require("../addon");

module.exports = (req, res) => {
  return addon(req, res); // Vercel expects a handler function
};
