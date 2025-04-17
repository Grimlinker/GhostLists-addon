const addon = require("../addon");

module.exports = async (req, res) => {
  try {
    return addon(req, res);
  } catch (err) {
    console.error("Serverless handler error:", err);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
};
