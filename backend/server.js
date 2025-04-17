const express = require("express");
const addon = require("./addon");

const app = express();

// Use the Express middleware from addon.js
app.use(addon);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ GhostLists backend running at http://localhost:${PORT}`);
});
