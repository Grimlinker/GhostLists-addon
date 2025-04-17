// backend/scripts/testCatalog.js

// Load the addon interface (it’s a Promise because it's async)
const getAddon = require('../addon');

// Mock a fake catalog request
const req = {
  query: {
    type: "movie",                     // or "series"
    id: "ghostlists-movies",          // must match your manifest catalog ID
    extra: { search: "" }             // optional, can include filters
  }
};

// Fake response object
const res = {
  setHeader: (key, value) => console.log(`Header: ${key} = ${value}`),
  status: (code) => {
    console.log(`Status: ${code}`);
    return res;
  },
  json: (data) => {
    console.log("Catalog Response:", JSON.stringify(data, null, 2));
  }
};

// Trigger the handler
getAddon.then(addonInterface => {
  if (addonInterface.catalog) {
    addonInterface.catalog(req, res);
  } else {
    console.error("❌ No catalog handler found.");
  }
});
