import ROUTES, { ROUTE_TAB_ANIMATIONS } from "./js/routes.js";
import tabAccessibility, { jumpToContent } from "./js/accessibility.js";

// Global Variables
const $APP = document.getElementById("app");
const $PRIMARY_NAV = document.getElementById("primary-navigation");
const PAGES_CSS_CLASSES = ["home", "destination", "crew", "technology"];
let tabsPanelContent;

/*---------------------*/
/* Window              */
/*---------------------*/

window.onload = async () => {
  tabsPanelContent = await fetchData("src/data.json");
  init();
};

// Update the UI when user navigates the session history (go back/forward)
window.onpopstate = () => {
  init();
};

function init() {
  const location = window.location;
  if (isValidRoute({ pathname: location.pathname, hash: location.hash })) {
    renderPage();
    document.getElementById("loading").setAttribute("hidden", "true");
  } else {
    console.log("An Error occurred");
  }
}

/**
 * Checks if the route exists.
 * @param {{pathname: string, hash: string}} locationObj
 * @returns True or throw error
 */
function isValidRoute(locationObj) {
  const { pathname, hash } = locationObj;
  const route = ROUTES[pathname];

  if (!route) {
    throw new Error(`Pathname ${pathname} is not a valid route.`);
  } else if (hash) {
    if (!Object.hasOwn(route, "hashes") || !route.hashes[hash]) {
      throw new Error(`Route ${pathname}${hash} does not exist`);
    }
    return true;
  } else if (!hash && Object.hasOwn(route, "hashes")) {
    throw new Error(`Route ${pathname} missing a hash(#).`);
  }

  return true;
}

function renderPage() {
  updatePrimaryNav();
  renderMainContent();
}

function updatePrimaryNav() {
  const currentPath = window.location.pathname;
  $PRIMARY_NAV.querySelector("li.active")?.classList.remove("active");
  $PRIMARY_NAV
    .querySelector(`a[href*="${currentPath}"]`)
    .parentNode.classList.add("active");
}

$PRIMARY_NAV.addEventListener("click", (e) => {
  e.preventDefault();
  const target = e.target.closest("a");

  if (!target) return;
  const route = target.getAttribute("href").split(/(?=#)/);
  navigateToPage({ pathname: route[0], hash: route[1] || "" });
});

/**
 * If is a valid route it updates the URL and the content accordingly.
 * @param {{pathname: string, hash: string}} pagePathHash
 */
function navigateToPage(pagePathHash) {
  if (!isValidRoute(pagePathHash)) return console.log("An Error occurred");

  updateURL(pagePathHash.pathname + pagePathHash.hash);

  renderPage();
  $APP.focus();
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

  tabListHandler();
}

/**
 * It adds all the tab functionality (accessibility and eventListener)
 */
function tabListHandler() {
  const $tabList = document.querySelector('#main [role = "tablist"]');

  if (!$tabList) return;

  tabAccessibility($tabList);
  $tabList.addEventListener("click", switchTabHandle);

  renderTab();
}

function switchTabHandle(e) {
  e.preventDefault();
  let target = e.target.closest("a");
  if (!target) return;

  navigateToTab(target.getAttribute("href"));
  target.focus();
}

/**
 * If is a valid hash it updates the URL and the tabPanel accordingly.
 * @param {string} hash
 */
function navigateToTab(hash) {
  const routeObj = { pathname: window.location.pathname, hash };
  if (!isValidRoute(routeObj)) return console.log("An Error occurred");

  updateURL(routeObj.pathname + routeObj.hash);
  animatedTabRender();
}

function renderTab() {
  updateActiveTab();
  renderActiveTabPanel();
}

function animatedTabRender() {
  updateActiveTab();
  animatedTabPanelChange();
}

function updateActiveTab() {
  const tabList = document.querySelector('#main [role="tablist"]');
  const previousTab = tabList.querySelector('a[aria-selected="true"]');
  previousTab.setAttribute("aria-selected", "false");
  previousTab.setAttribute("tabindex", "-1");

  const newActiveTab = tabList.querySelector(
    `a[href="${window.location.hash}"]`
  );
  newActiveTab.setAttribute("aria-selected", "true");
  newActiveTab.setAttribute("tabindex", 0);
}

function animatedTabPanelChange() {
  const page = ROUTES[window.location.pathname];
  const $tabArticle = document.querySelector('[data-id="article"]');
  $tabArticle.classList.remove("block-reveal");
  $tabArticle.classList.add("block-hide");

  const $tabImg = document.getElementById("picture");
  $tabImg.setAttribute("class", ROUTE_TAB_ANIMATIONS[page.id].hide);
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

  $tabArticle.id = tabPanelContent.name;
  $tabArticle.setAttribute("tabindex", 0);
  $tabArticle.setAttribute("role", "tabpanel");
  $tabArticle.querySelectorAll("[data-id]").forEach((element) => {
    element.textContent = tabPanelContent[element.getAttribute("data-id")];
  });

  $tabArticle.classList.remove("block-hide");
  $tabArticle.classList.add("block-reveal");
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
    $tabImg.setAttribute("class", ROUTE_TAB_ANIMATIONS[page].show);
  };
}

/*---------------------*/
/* Utilities           */
/*---------------------*/

/**
 * Updates the URL.
 * @param {string} pathname
 */
function updateURL(pathname) {
  window.history.pushState({}, pathname, window.location.origin + pathname);
}

async function fetchData(url) {
  try {
    const res = await fetch(url);

    if (!res.ok) throw new Error("Could not fetch data");

    return await res.json();
  } catch (error) {
    console.log(error);
  }
}

document.getElementById("skip").addEventListener("click", jumpToContent);
