const { fetchRpdbAssets } = require("./fetchRpdbAssets");

async function generateManifest({ displayOrder, catalogs, groups, addonName, addonId, rpdbKey, icon }) {
  const getCatalogKey = (cat) => `${cat.id}-${cat.type}`;
  const groupedIds = new Set(groups.flatMap(g => g.listIds));
  const catalogsByKey = Object.fromEntries(catalogs.map(c => [getCatalogKey(c), c]));
  const resultCatalogs = [];

  for (const entry of displayOrder) {
    if (entry.startsWith("group:")) {
      const groupId = entry.replace("group:", "");
      const group = groups.find(g => g.id === groupId);
      if (!group) continue;

      const groupCatalogs = group.listIds
        .map(id => catalogsByKey[id])
        .filter(c => c && c.enabled);

      if (!groupCatalogs.length) continue;

      const type = groupCatalogs[0].type;
      const allShowInHome = groupCatalogs.every(c => c.showInHome);

      resultCatalogs.push({
        id: `ghostlists-${type}-group-${groupId}`,
        type,
        name: group.name,
        extra: [{
          name: "genre",
          options: groupCatalogs.map(c => c.name),
          isRequired: true,
        }],
        extraSupported: ["genre"],
        behaviorHints: allShowInHome ? { defaultIncluded: true } : undefined,
        logo: icon,
      });
    }

    if (entry.startsWith("catalog:")) {
      const key = entry.replace("catalog:", "");
      const cat = catalogsByKey[key];
      if (!cat || !cat.enabled || groupedIds.has(key)) continue;

      let poster = icon;
      let background = icon;

      if (cat.imdbId && rpdbKey) {
        const rpdb = await fetchRpdbAssets(cat.imdbId, rpdbKey);
        if (rpdb.poster) poster = rpdb.poster;
        if (rpdb.background) background = rpdb.background;
      }

      resultCatalogs.push({
        id: `ghostlists-${cat.type}-${cat.id}`,
        type: cat.type,
        name: cat.name,
        poster,
        background,
        logo: cat.icon || icon,
        behaviorHints: cat.showInHome ? { defaultIncluded: true } : undefined,
      });
    }
  }

  return {
    id: addonId,
    version: "1.0.0",
    name: addonName,
    logo: icon,
    catalogs: resultCatalogs,
    resources: ["catalog", "meta"],
    types: ["movie", "series"],
    idPrefixes: ["tt"],
    behaviorHints: { configurable: true },
  };
}

module.exports = { generateManifest };
