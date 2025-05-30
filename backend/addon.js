require("dotenv").config();
const express = require("express");
const path = require("path");
const axios = require("axios");
const { parseConfig } = require("./utils/parseConfig");
const { getManifest } = require("./lib/getManifest");

const addon = express();

// Helper to send JSON with caching headers
const respond = function (res, data, opts = {}) {
  const cacheHeaders = [];
  if (opts.cacheMaxAge)      cacheHeaders.push(`max-age=${opts.cacheMaxAge}`);
  if (opts.staleRevalidate)  cacheHeaders.push(`stale-while-revalidate=${opts.staleRevalidate}`);
  if (opts.staleError)       cacheHeaders.push(`stale-if-error=${opts.staleError}`);
  if (cacheHeaders.length) {
    res.setHeader("Cache-Control", cacheHeaders.join(", ") + ", public");
  }
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Content-Type", "application/json");
  res.json(data);
};

// Fetch metadata from MDBList API
async function getMetaFromMDBList(type, imdbId, config = {}) {
  const apikey = config.rpdbkey || process.env.MDBLIST_API_KEY;
  const { data } = await axios.get("https://mdblist.com/api/", {
    params: { id: imdbId, apikey }
  });
  return {
    meta: {
      id: `mdblist:${data.idIMDb}`,
      name: data.title,
      type: data.type,
      year: data.year,
      description: data.plot,
      poster: data.poster,
      background: data.backdrop,
      imdbRating: data.rating?.toFixed(1),
      genres: data.genres,
      releaseInfo: data.year,
      behaviorHints: {
        defaultVideoId: data.idIMDb
      }
    }
  };
}

// 1) Redirect root to /configure/
addon.get("/", (_, res) => {
  res.redirect("/configure/");
});

// 2) Serve the built React app from frontend/dist
addon.use(
  "/configure",
  express.static(path.join(__dirname, "../frontend/dist"))
);

// 3) SPA fallback for any /configure/* route
addon.get(
  ["/configure/", "/configure/:catalogChoices/configure"],
  (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  }
);

// 4) Manifest endpoint
addon.get(
  ["/manifest.json", "/:catalogChoices/manifest.json"],
  (req, res) => {
    const config = parseConfig(req.params.catalogChoices || "");
    const manifest = getManifest(config);
    respond(res, manifest, {
      cacheMaxAge: 12 * 60 * 60,
      staleRevalidate: 7 * 24 * 60 * 60,
      staleError: 30 * 24 * 60 * 60
    });
  }
);

// 5) Catalog endpoint
addon.get(
  [
    "/catalog/:type/:id.json",
    "/catalog/:type/:id/:extra.json",
    "/:catalogChoices/catalog/:type/:id.json",
    "/:catalogChoices/catalog/:type/:id/:extra.json"
  ],
  async (req, res) => {
    const { type, id } = req.params;
    const config = parseConfig(req.params.catalogChoices);
    const page = 1;
    try {
      const { data } = await axios.get("https://mdblist.com/api/userlist", {
        params: {
          apikey: process.env.MDBLIST_API_KEY,
          list: id,
          page
        }
      });
      const metas = data.results.map(item => ({
        id: `mdblist:${item.idIMDb}`,
        type: item.type,
        name: item.title,
        year: item.year,
        genres: item.genres,
        poster: item.poster,
        background: item.backdrop,
        releaseInfo: item.year
      }));
      respond(res, { metas });
    } catch (err) {
      console.error("Catalog error:", err.message);
      res.status(500).send("Failed to load catalog");
    }
  }
);

// 6) Meta endpoint
addon.get(
  ["/meta/:type/:id.json", "/:catalogChoices/meta/:type/:id.json"],
  async (req, res) => {
    const { type, id } = req.params;
    const config = parseConfig(req.params.catalogChoices);
    const imdbId = id.replace("mdblist:", "").replace("tmdb:", "");
    try {
      const meta = await getMetaFromMDBList(type, imdbId, config);
      respond(res, meta, {
        cacheMaxAge: 7 * 24 * 60 * 60,
        staleRevalidate: 14 * 24 * 60 * 60,
        staleError: 30 * 24 * 60 * 60
      });
    } catch (err) {
      console.error("Meta error:", err.message);
      respond(res, { meta: {} });
    }
  }
);

module.exports = addon;