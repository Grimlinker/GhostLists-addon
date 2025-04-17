export async function fetchRpdbAssets(imdbId: string, apiKey: string) {
  try {
    const res = await fetch(`https://api.reelgood.com/v3/posters/${imdbId}?apiKey=${apiKey}`);
    if (!res.ok) throw new Error("Failed to fetch RPDB assets");
    return await res.json();
  } catch (e) {
    console.error("RPDB fetch failed:", e);
    return {};
  }
}
