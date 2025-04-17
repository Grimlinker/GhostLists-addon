const packageJson = require("../package.json");

function getManifest(config = {}) {
  const catalogs = [
    createCatalog("alysadanae7/superhero", "movie", "Superhero"),
    createCatalog("alysadanae7/animation", "series", "Animated Series")
  ];

  return {
    id: "ghostlists-addon",
    version: packageJson.version,
    name: "GhostLists MDBList Addon",
    description: "MDBList-powered Stremio addon with customizable user lists",
    types: ["movie", "series"],
    resources: ["catalog", "meta"],
    idPrefixes: ["tt"],
    behaviorHints: {
      configurable: true,
      configurationRequired: false
    },
    catalogs
  };
}

function createCatalog(id, type, name) {
  return {
    id,
    type,
    name,
    pageSize: 20,
    extra: [
      { name: "skip", isRequired: true }
    ]
  };
}

module.exports = { getManifest };
