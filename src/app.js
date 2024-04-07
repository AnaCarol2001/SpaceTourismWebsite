/*---------------------*/
/* Content: 
    - Router
    - Event Listener
    - Utilities
    - Window           */
/*---------------------*/

import tabAccessibility from "/src/accessibility.js";

const $APP = document.getElementById("app");
const $PRIMARY_NAV = document.getElementById("primary-navigation");
let tabsData;

/*---------------------*/
/* Router              */
/*---------------------*/
const ROUTES = {
  "/home": { id: "home", title: "Home" },
  "/destinations": {
    id: "destinations",
    title: "Destinations",
    hashes: [
      { hash: "#Moon", id: "Moon" },
      { hash: "#Mars", id: "Mars" },
      { hash: "#Europa", id: "Europa" },
      { hash: "#Titan", id: "Titan" },
    ],
  },
  "/crew": {
    id: "crew",
    title: "Crew",
    hashes: [
      { hash: "#Douglas_Hurley", id: "Douglas Hurley" },
      { hash: "#Mark_Shuttleworth", id: "Mark Shuttleworth" },
      { hash: "#Victor_Glover", id: "Victor Glover" },
      { hash: "#Anousheh_Ansari", id: "Anousheh Ansari" },
    ],
  },
  "/technology": {
    id: "technology",
    title: "Technology",
    hashes: [
      { hash: "#Launch_vehicle", id: "Launch vehicle" },
      { hash: "#Spaceport", id: "Spaceport" },
      { hash: "#Space_capsule", id: "Space capsule" },
    ],
  },
};

/**
 * It updates the URL and the content accordingly.
 * @param {{pathname: string, hash: string}} pathObj
 */
function navigate(pathObj) {
  const newPath = pathObj.pathname + pathObj.hash;
  const currentPage = window.location.pathname;

  // Update the current URL
  window.history.pushState({}, newPath, window.location.origin + newPath);

  if (pathObj.pathname !== currentPage) {
    // update the whole page
    updateRoute();
  } else updateTabPanel(); // updates only the tab
}

function updateRoute() {
  // Get the path from the current URL
  const path = window.location.pathname;
  const route = ROUTES[path];

  // if the path doesn't exist return to Home page
  if (!route) {
    return navigate({ pathname: "/home", hash: "" });
  }

  // Get the new content
  const template = document.getElementById(route.id);
  const content = template.content.cloneNode(true);

  // Update app CSS
  $APP.classList.remove("home", "destination", "crew", "technology");
  $APP.classList.add(route.id);

  // Update active navigation
  $PRIMARY_NAV.querySelector("li.active")?.classList.remove("active");
  $PRIMARY_NAV
    .querySelector(`a[href="${path}"]`)
    .parentNode.classList.add("active");

  // Replace old content with the new one
  const $MAIN = $APP.querySelector("#main");
  if ($MAIN) $MAIN.remove();
  $APP.appendChild(content);

  tabListHandler();

  // Update page title
  document.title = "Space Tourism | " + route.title;
}

function updateTabPanel() {
  const path = window.location.pathname;
  const tab = window.location.hash;
  const route = ROUTES[path];
  const hash = route.hashes.find((current) => current.hash === tab);

  if (!route || !hash) {
    return navigate({ pathname: "/home", hash: "" });
  }

  const tabData = tabsData[route.id].find((tabInfo) => tabInfo.name == hash.id);

  const $tabArticle = document.querySelector('[data-id="article"]');
  const $tabImg = document.getElementById("picture");

  const tabSource = $tabImg.querySelector("source");
  const tabImg = $tabImg.querySelector("img");

  tabSource.setAttribute(
    "srcset",
    tabData.images[tabSource.getAttribute("data-id")]
  );
  tabImg.setAttribute("src", tabData.images[tabImg.getAttribute("data-id")]);
  tabImg.setAttribute("alt", tabData.name);

  $tabArticle.id = hash.id;
  $tabArticle.setAttribute("tabindex", 0);
  $tabArticle.setAttribute("role", "tabpanel");
  $tabArticle.querySelectorAll("[data-id]").forEach((element) => {
    element.textContent = tabData[element.getAttribute("data-id")];
  });
}

/*---------------------*/
/* Event Listener      */
/*---------------------*/

$PRIMARY_NAV.addEventListener("click", (e) => {
  e.preventDefault();
  const target =
    e.target.tagName === "LI"
      ? (e.target = e.target.querySelector("a"))
      : e.target;

  navigate({ pathname: target.getAttribute("href"), hash: "" });
});

function tabListHandler() {
  const $tabList = document.querySelector('[role="tablist"]');
  if (!$tabList) {
    return;
  }
  $tabList.addEventListener("click", switchTabHandle);
  tabAccessibility($tabList);

  if (window.location.hash) {
    const tab = $tabList.querySelector(`a[href="${window.location.hash}"]`);
    tab ? tab.click() : $tabList.firstElementChild.querySelector("a").click();
  } else {
    $tabList.firstElementChild.querySelector("a").click();
  }
}

function switchTabHandle(e) {
  e.preventDefault();
  let target = e.target.closest("a");
  if (!target) return;

  const previousTarget = e.currentTarget.querySelector(
    'a[aria-selected="true"]'
  );
  previousTarget.setAttribute("aria-selected", "false");
  previousTarget.setAttribute("tabindex", "-1");

  target.setAttribute("aria-selected", "true");
  target.setAttribute("tabindex", 0);
  target.focus();

  navigate({ pathname: e.target.pathname, hash: e.target.hash });
}

/*---------------------*/
/* Utilities           */
/*---------------------*/

async function fetchData(url) {
  try {
    const res = await fetch(url);

    if (!res.ok) throw new Error("Could not fetch data");

    return await res.json();
  } catch (error) {
    console.log(error);
  }
}

/*---------------------*/
/* Window              */
/*---------------------*/

window.onload = async () => {
  tabsData = await fetchData("src/data.json");
  updateRoute();
};

// Update the UI when user navigates the session history (go back/forward)
window.onpopstate = () => {
  updateRoute();
};
