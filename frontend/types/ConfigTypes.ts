export interface Catalog {
  id: string;
  name: string;
  type: "movie" | "series";
  enabled: boolean;
  showInHome: boolean;
  icon?: string;
  imdbId?: string;
}

export interface Group {
  id: string;
  name: string;
  listIds: string[]; // Catalog keys: `${id}-${type}`
  enabled: boolean;
  showInHome: boolean;
  type: "movie" | "series" | "unknown";
}
