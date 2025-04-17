module.exports = {
  catalogs: [
    { 
      id: "ghostlists-movies", 
      name: "Movies", 
      type: "movie", 
      enabled: true, 
      showInHome: true 
    },
    { 
      id: "ghostlists-series", 
      name: "Series", 
      type: "series", 
      enabled: true, 
      showInHome: false 
    }
  ],
  groups: [],
  displayOrder: ["ghostlists-movies", "ghostlists-series"]
};
