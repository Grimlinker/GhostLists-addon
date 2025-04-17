import type { Catalog, Group } from "@/contexts/ConfigContext";
import { fetchRpdbAssets } from "@/utils/fetchRpdbAssets";

interface ManifestCatalog {
  type: "movie" | "series";
  id: string;
  name: string;
  extra?: Array<{
    name: string;
    options: string[];
    isRequired?: boolean;
  }>;
  extraSupported?: string[];
  behaviorHints?: {
    configurable?: boolean;
  };
  poster?: string;
  background?: string;
  logo?: string;
  description?: string;
}

interface GenerateManifestOptions {
  displayOrder: string[];
  catalogs: Catalog[];
  groups: Group[];
  addonName: string;
  addonId: string;
  rpdbKey: string;
  icon?: string;
  fallbackGenres?: string[];
  fallbackPoster?: string;
  fallbackBackground?: string;
}

export async function generateManifest({
  displayOrder,
  catalogs,
  groups,
  addonName,
  addonId,
  rpdbKey,
  icon = "/favicon.png",
  fallbackGenres = ["General"],
  fallbackPoster = icon,
  fallbackBackground = icon,
}: GenerateManifestOptions) {
  const getCatalogKey = (cat: Catalog) => `${cat.id}-${cat.type}`;
  const groupedIds = new Set(groups.flatMap((g) => g.listIds));
  const catalogsByKey = Object.fromEntries(catalogs.map((c) => [getCatalogKey(c), c]));

  const resultCatalogs: ManifestCatalog[] = [];

  for (const entry of displayOrder) {
    if (entry.startsWith("group:")) {
      const groupId = entry.replace("group:", "");
      const group = groups.find((g) => g.id === groupId);
      if (!group) continue;

      const groupCatalogs = group.listIds
        .map((id) => catalogsByKey[id])
        .filter((c): c is Catalog => !!c && c.enabled);

      if (groupCatalogs.length === 0) continue;

      const type = groupCatalogs[0].type;
      const allShowInHome = groupCatalogs.every((c) => c.showInHome);

      const genreOptions = groupCatalogs.length
        ? groupCatalogs.map((c) => c.name)
        : fallbackGenres;

      const catalogEntry: ManifestCatalog = {
        type,
        id: `ghostlists-${type}-group-${groupId}`,
        name: group.name,
        extra: [
          {
            name: "genre",
            options: genreOptions,
            isRequired: true,
          },
        ],
        extraSupported: ["genre"],
        behaviorHints: { configurable: true },
        poster: icon,
        logo: icon,
        background: fallbackBackground,
      };

      if (allShowInHome) {
        catalogEntry.behaviorHints = { configurable: true };
      }

      resultCatalogs.push(catalogEntry);
    }

    if (entry.startsWith("catalog:")) {
      const key = entry.replace("catalog:", "");
      const catalog = catalogsByKey[key];
      if (!catalog || !catalog.enabled || groupedIds.has(key)) continue;

      let poster = fallbackPoster;
      let background = fallbackBackground;

      if (catalog.imdbId && rpdbKey) {
        const rpdb = await fetchRpdbAssets(catalog.imdbId, rpdbKey);
        if (rpdb.poster) poster = rpdb.poster;
        if (rpdb.background) background = rpdb.background;
      }

      resultCatalogs.push({
        type: catalog.type,
        id: `ghostlists-${catalog.type}-${catalog.id}`,
        name: catalog.name,
        poster,
        background,
        logo: catalog.icon || icon,
        behaviorHints: { configurable: true },
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
