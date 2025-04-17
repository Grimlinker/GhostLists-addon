export interface Catalog {
  id: string;
  type: "movie" | "series";
  name: string;
  enabled: boolean;
  showInHome: boolean;
  icon?: string;
}

export interface Group {
  id: string;
  name: string;
  listIds: string[];
}
