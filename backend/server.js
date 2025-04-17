const { createServer } = require("http");
const addon = require("./addon");

const PORT = process.env.PORT || 3000;

createServer(addon).listen(PORT, () => {
  console.log(`GhostLists backend running on http://localhost:${PORT}`);
});
