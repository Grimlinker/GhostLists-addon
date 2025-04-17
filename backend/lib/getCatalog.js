require("dotenv").config();
const axios = require("axios");

async function getCatalog(type, listId, page = 1) {
  const apikey = process.env.MDBLIST_API_KEY;
  if (!apikey || !listId) throw new Error("Missing MDBLIST_API_KEY or listId");

  try {
    const { data } = await axios.get("https://mdblist.com/api/userlist", {
      params: {
        apikey,
        list: listId,
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

    return { metas };
  } catch (err) {
    console.error("getCatalog error:", err.message);
    throw err;
  }
}

module.exports = { getCatalog };
