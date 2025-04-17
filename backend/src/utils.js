function sortCatalogsByDisplayOrder(catalogs, displayOrder) {
    return catalogs.sort((a, b) => displayOrder.indexOf(a.id) - displayOrder.indexOf(b.id));
  }
  
  module.exports = { sortCatalogsByDisplayOrder };
  