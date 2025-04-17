// backend/scripts/generateConfig.js

const { catalogs, groups, displayOrder } = require("../src/data");

const config = {
  catalogs: catalogs.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type,
    enabled: c.enabled,
    showInHome: c.showInHome,
    icon: c.icon || "/favicon.png"
  })),
  apiKey: "your-mdblist-api-key-here",
  rpdbKey: "your-rpdb-api-key-here"
};

const base64 = Buffer.from(JSON.stringify(config)).toString("base64");

console.log("✅ GhostLists Config:");
console.log(JSON.stringify(config, null, 2));

console.log("\n🔐 Base64-Encoded Config:");
console.log(base64);

console.log("\n📦 Example Manifest URL:");
console.log(`https://your-domain.vercel.app/${base64}/manifest.json`);
