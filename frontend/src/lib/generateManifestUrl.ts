import { Catalog, Group } from "@/contexts/ConfigContext";

export function generateManifestUrl({
  catalogs,
  groups,
  apiKey,
  rpdbKey,
  base = "https://ghostlists.vercel.app"
}: {
  catalogs: Catalog[];
  groups: Group[];
  apiKey: string;
  rpdbKey?: string;
  base?: string;
}): string {
  const config = {
    catalogs,
    groups,
    apiKey,
    rpdbKey
  };
  const encoded = btoa(JSON.stringify(config));
  return `${base}/${encoded}/manifest.json`;
}
