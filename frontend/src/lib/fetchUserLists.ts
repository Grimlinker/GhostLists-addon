export interface MDBList {
  id: string;
  name: string;
  mediatype: "movie" | "show";
  description?: string;
  [key: string]: any;
}

export interface Catalog {
  id: string;
  name: string;
  type: "movie" | "series";
  enabled: boolean;
  showInHome: boolean;
  icon?: string;
}

export async function fetchUserLists(apiKey: string): Promise<Catalog[]> {
  try {
    const res = await fetch(`https://api.mdblist.com/lists/user/?apikey=${apiKey}`);
    const lists: MDBList[] = await res.json();

    if (!Array.isArray(lists)) throw new Error("Invalid MDBList response");

    return lists.map((list): Catalog => ({
      id: list.id,
      name: list.name,
      type: list.mediatype === "show" ? "series" : "movie",
      enabled: false,
      showInHome: false,
      icon: "https://mdblist.com/static/mdblist.png"
    }));
  } catch (err) {
    console.error("Failed to fetch user lists from MDBList:", err);
    return [];
  }
}
