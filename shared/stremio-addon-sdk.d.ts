declare module "stremio-addon-sdk" {
    export interface Manifest {
      id: string;
      version: string;
      name: string;
      description: string;
      logo?: string;
      background?: string;
      catalogs: Catalog[];
      resources: ("catalog" | "meta" | string)[];
      types: ("movie" | "series" | string)[];
      behaviorHints?: {
        configurable?: boolean;
        defaultIncluded?: boolean;
      };
    }
  
    export interface Catalog {
      type: string;
      id: string;
      name: string;
      extra?: Array<{
        name: string;
        options: string[];
      }>;
      behaviorHints?: {
        defaultIncluded?: boolean;
      };
    }
  
    export const addonBuilder: any;
  }
  