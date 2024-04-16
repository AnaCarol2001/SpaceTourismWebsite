const ROUTES = {
  "/": { id: "home", title: "Home" },
  "/destinations": {
    id: "destinations",
    title: "Destinations",
    hashes: {
      "#Moon": { id: "Moon" },
      "#Mars": { id: "Mars" },
      "#Europa": { id: "Europa" },
      "#Titan": { id: "Titan" },
    },
  },
  "/crew": {
    id: "crew",
    title: "Crew",
    hashes: {
      "#Douglas_Hurley": { id: "Douglas Hurley" },
      "#Mark_Shuttleworth": { id: "Mark Shuttleworth" },
      "#Victor_Glover": { id: "Victor Glover" },
      "#Anousheh_Ansari": { id: "Anousheh Ansari" },
    },
  },
  "/technology": {
    id: "technology",
    title: "Technology",
    hashes: {
      "#Launch_vehicle": { id: "Launch vehicle" },
      "#Spaceport": { id: "Spaceport" },
      "#Space_capsule": { id: "Space capsule" },
    },
  },
};
export default ROUTES;

export const ROUTE_TAB_ANIMATIONS = {
  destinations: {
    hide: "scaleDown",
    show: "scaleUp",
  },
  crew: {
    hide: "slideRight",
    show: "slideLeft",
  },
  technology: {
    hide: "fadeOut",
    show: "fadeIn",
  },
};
