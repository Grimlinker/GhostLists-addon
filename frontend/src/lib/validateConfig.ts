import type { Catalog, Group } from "@/contexts/ConfigContext";

export interface Config {
  catalogs: Catalog[];
  groups: Group[];
  displayOrder: string[];
}

export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateConfig({ catalogs, groups, displayOrder }: Config): ConfigValidationResult {
  const errors: string[] = [];

  // 1. Check for duplicate catalog IDs
  const catalogKeys = new Set<string>();
  for (const cat of catalogs) {
    if (!cat.id || !cat.type) {
      errors.push(`Catalog "${cat.name}" is missing id or type.`);
    }

    const key = `${cat.id}-${cat.type}`;
    if (catalogKeys.has(key)) {
      errors.push(`Duplicate catalog key: ${key}`);
    } else {
      catalogKeys.add(key);
    }
  }

  // 2. Check group listIds reference real catalog keys
  for (const group of groups) {
    for (const listId of group.listIds) {
      if (!catalogKeys.has(listId)) {
        errors.push(`Group "${group.name}" references missing catalog: ${listId}`);
      }
    }
  }

  // 3. Validate displayOrder keys
  for (const entry of displayOrder) {
    if (!entry.startsWith("catalog:") && !entry.startsWith("group:")) {
      errors.push(`Invalid displayOrder entry: ${entry}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
