/*---------------------*/
/* Content: 
    - Window           
    - Router
    - Utilities
*/
/*---------------------*/

import tabAccessibility from "/src/accessibility.js";

const $APP = document.getElementById("app");
const $PRIMARY_NAV = document.getElementById("primary-navigation");
let tabsPanelContent;
const PAGES_CSS_CLASSES = ["home", "destination", "crew", "technology"];
const TAB_ANIMATIONS = {
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

/*---------------------*/
/* Window              */
/*---------------------*/

window.onload = async () => {
  tabsPanelContent = await fetchData("src/data.json");
  renderPage();
  document.getElementById("loading").setAttribute("hidden", "true");
};

// Update the UI when user navigates the session history (go back/forward)
window.onpopstate = () => {
  renderPage();
};

function renderPage() {
  updatePrimaryNav();
  renderMainContent();
}
/*---------------------*/
/* Router              */
/*---------------------*/

$PRIMARY_NAV.addEventListener("click", (e) => {
  e.preventDefault();
  const target = e.target.closest("a");

  if (!target) return;

  navigateToPage(target.getAttribute("href"));
});

/**
 * It updates the URL and the content accordingly.
 * @param {{pathname: string, hash: string}} pathObj
 */
function navigateToPage(pagePath) {
  if (!ROUTES[pagePath]) {
    throw new Error(`Route ${pagePath} does not exist.`);
  }
  updateURLPathname(pagePath);
  renderPage();
  $APP.focus();
}

function updatePrimaryNav() {
  const currentPath = window.location.pathname;
  $PRIMARY_NAV.querySelector("li.active")?.classList.remove("active");
  $PRIMARY_NAV
    .querySelector(`a[href="${currentPath}"]`)
    .parentNode.classList.add("active");
}

function updateURLPathname(pathname) {
  window.history.pushState({}, pathname, window.location.origin + pathname);
}

function renderMainContent() {
  const currentPathname = window.location.pathname;
  const route = ROUTES[currentPathname];

  updatePageMeta(route.title);
  updateMainContentHTML(route.id);
}

function updatePageMeta(pageTitle) {
  document.title = "Space Tourism | " + pageTitle;
}

function updateMainContentHTML(templateId) {
  const template = document.getElementById(templateId);
  const newContent = template.content.cloneNode(true);

  $APP.classList.remove(...PAGES_CSS_CLASSES);
  $APP.classList.add(templateId);

  const currentMainContent = $APP.querySelector("#main");
  if (currentMainContent) currentMainContent.remove();

  $APP.appendChild(newContent);

  if ($APP.querySelector('#main [role="tablist"]')) {
    tabListHandler();
  }
}

function tabListHandler() {
  const $tabList = document.querySelector('#main [role = "tablist"]');

  tabAccessibility($tabList);
  $tabList.addEventListener("click", switchTabHandle);

  if (window.location.hash) {
    const tab = $tabList.querySelector(`a[href="${window.location.hash}"]`);
    updateActiveTab($tabList, tab);
  } else {
    const firstTab = $tabList.firstElementChild.querySelector("a");
    updateURLHash(firstTab.getAttribute("href"));
    updateActiveTab($tabList, firstTab);
  }
  renderActiveTabPanel();
}

function switchTabHandle(e) {
  e.preventDefault();
  let target = e.target.closest("a");
  if (!target) return;

  updateURLHash(target.getAttribute("href"));
  updateActiveTab(e.currentTarget, target);
  animatedRenderActiveTabPanel();
  target.focus();
}

function updateURLHash(hash) {
  if (!ROUTES[window.location.pathname].hashes[hash]) {
    throw new Error(`Route hash ${hash} does not exist`);
  }
  const newPathHash = window.location.pathname + hash;
  window.history.pushState(
    {},
    newPathHash,
    window.location.origin + newPathHash
  );
}

function updateActiveTab(tabList, newActiveTab) {
  const previousTab = tabList.querySelector('a[aria-selected="true"]');
  previousTab.setAttribute("aria-selected", "false");
  previousTab.setAttribute("tabindex", "-1");

  newActiveTab.setAttribute("aria-selected", "true");
  newActiveTab.setAttribute("tabindex", 0);
}

function animatedRenderActiveTabPanel() {
  const page = ROUTES[window.location.pathname];
  const $tabArticle = document.querySelector('[data-id="article"]');
  $tabArticle.classList.remove("block-reveal");
  $tabArticle.classList.add("block-hide");

  const $tabImg = document.getElementById("picture");
  $tabImg.setAttribute("class", TAB_ANIMATIONS[page.id].hide);
  $tabImg.onanimationend = () => {
    renderActiveTabPanel();
  };
}

function renderActiveTabPanel() {
  const page = ROUTES[window.location.pathname];
  const tabPanelId = page.hashes[window.location.hash].id;

  const tabPanelContent = tabsPanelContent[page.id].find(
    (tabContent) => tabContent.name == tabPanelId
  );

  const $tabArticle = document.querySelector('[data-id="article"]');

  renderActiveTabPanelImages(tabPanelContent.images, tabPanelContent.name);

  $tabArticle.classList.remove("block-hide");
  $tabArticle.classList.add("block-reveal");

  $tabArticle.id = tabPanelContent.name;
  $tabArticle.setAttribute("tabindex", 0);
  $tabArticle.setAttribute("role", "tabpanel");
  $tabArticle.querySelectorAll("[data-id]").forEach((element) => {
    element.textContent = tabPanelContent[element.getAttribute("data-id")];
  });
}

function renderActiveTabPanelImages(images, alt) {
  const page = ROUTES[window.location.pathname].id;
  const $tabImg = document.getElementById("picture");
  const tabSource = $tabImg.querySelector("source");
  const tabImg = $tabImg.querySelector("img");

  tabSource.setAttribute("srcset", images[tabSource.getAttribute("data-id")]);
  tabImg.setAttribute("src", images[tabImg.getAttribute("data-id")]);
  tabImg.setAttribute("alt", alt);
  tabImg.onload = () => {
    $tabImg.setAttribute("class", TAB_ANIMATIONS[page].show);
  };
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
