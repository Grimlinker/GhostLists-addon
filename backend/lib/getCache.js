const cacheManager = require("cache-manager");
const mongodbStore = require("cache-manager-mongodb");

const GLOBAL_KEY_PREFIX = "ghostlists-addon";
const META_KEY_PREFIX = `${GLOBAL_KEY_PREFIX}|meta`;
const CATALOG_KEY_PREFIX = `${GLOBAL_KEY_PREFIX}|catalog`;

const META_TTL = parseInt(process.env.META_TTL) || 7 * 24 * 60 * 60; // 7 days
const CATALOG_TTL = parseInt(process.env.CATALOG_TTL) || 1 * 24 * 60 * 60; // 1 day

const MONGO_URI = process.env.MONGODB_URI;
const NO_CACHE = process.env.NO_CACHE === "true";

const cache = initializeCache();

function initializeCache() {
  if (NO_CACHE) {
    return null;
  }

  if (MONGO_URI) {
    return cacheManager.caching({
      store: mongodbStore,
      uri: MONGO_URI,
      options: {
        collection: "ghostlists_cache",
        ttl: META_TTL
      },
      ttl: META_TTL,
      ignoreCacheErrors: true
    });
  }

  return cacheManager.caching({
    store: "memory",
    ttl: META_TTL
  });
}

function cacheWrap(key, method, options) {
  if (NO_CACHE || !cache) {
    return method();
  }
  return cache.wrap(key, method, options);
}

function cacheWrapCatalog(id, method) {
  return cacheWrap(`${CATALOG_KEY_PREFIX}:${id}`, method, { ttl: CATALOG_TTL });
}

function cacheWrapMeta(id, method) {
  return cacheWrap(`${META_KEY_PREFIX}:${id}`, method, { ttl: META_TTL });
}

module.exports = {
  cacheWrapCatalog,
  cacheWrapMeta
};
