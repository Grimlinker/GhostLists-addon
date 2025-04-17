export const getDefaultLists = () => {
  return [
    {
      id: "mdblist.com/list/alysadanae7/superhero",
      name: "Superhero",
      type: "movie" as const,
      enabled: false,
      showInHome: false,
    },
    {
      id: "mdblist.com/list/alysadanae7/top-10-of-the-week",
      name: "Top 10 of the Week",
      type: "movie" as const,
      enabled: false,
      showInHome: false,
    },
    {
      id: "mdblist.com/list/alysadanae7/Latest",
      name: "Latest",
      type: "series" as const,
      enabled: false,
      showInHome: false,
    },
  ];
};
