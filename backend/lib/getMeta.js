require("dotenv").config();
const axios = require("axios");

const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const cache = new Map();

async function getMeta(type, id, config = {}) {
  const cacheKey = `${type}:${id}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { meta: cached.data };
  }

  try {
    const res = await axios.get("https://mdblist.com/api/", {
      params: { id, apikey: process.env.MDBLIST_API_KEY }
    });

    const data = res.data;

    const meta = {
      id: `mdblist:${data.idIMDb}`,
      type: data.type,
      name: data.title,
      description: data.plot,
      year: data.year,
      poster: data.poster,
      background: data.backdrop,
      imdbRating: data.rating.toFixed(1),
      genres: data.genres,
      releaseInfo: data.year,
      links: [
        { name: "IMDb", url: `https://www.imdb.com/title/${data.idIMDb}` }
      ],
      behaviorHints: {
        defaultVideoId: data.idIMDb
      }
    };

    cache.set(cacheKey, { data: meta, timestamp: Date.now() });

    return { meta };
  } catch (err) {
    console.error(`Error fetching MDBList meta for ${id}:`, err.message);
    throw err;
  }
}

module.exports = { getMeta };
