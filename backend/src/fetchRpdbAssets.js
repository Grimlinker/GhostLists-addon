const fetch = require("node-fetch");

async function fetchRpdbAssets(imdbId, apiKey) {
  try {
    const res = await fetch(`https://api.reelgood.com/v3/posters/${imdbId}?apiKey=${apiKey}`);
    const json = await res.json();

    return {
      poster: json.poster,
      background: json.background,
      logo: json.logo
    };
  } catch (e) {
    console.error("RPDB fetch failed:", e.message);
    return {};
  }
}

module.exports = { fetchRpdbAssets };
