export function sortByDisplayOrder<T extends { id: string; type: string }>(
    items: T[],
    displayOrder: string[]
  ): T[] {
    const getKey = (item: T) => `catalog:${item.id}-${item.type}`;
  
    return [...items].sort((a, b) => {
      const keyA = getKey(a);
      const keyB = getKey(b);
      const indexA = displayOrder.indexOf(keyA);
      const indexB = displayOrder.indexOf(keyB);
  
      // Items not in displayOrder come last
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }
  