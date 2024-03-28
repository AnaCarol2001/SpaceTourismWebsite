const $APP = document.getElementById("app");
const $PRIMARY_NAV = document.getElementById("primary-navigation");

/*---------------------*/
/* Router              */
/*---------------------*/
const ROUTES = {
  "/home": { id: "home", title: "Home" },
  "/destination": { id: "destination", title: "Destination" },
  "/crew": { id: "crew", title: "Crew" },
  "/technology": { id: "technology", title: "Technology" },
};

function navigate(path) {
  // Update the current URL
  window.history.pushState({}, path, window.location.origin + path);

  // Update UI
  updateRoute();
}

function updateRoute() {
  // Get the path from the current URL
  const path = window.location.pathname;
  const route = ROUTES[path];

  // if the path doesn't exist return to Home page
  if (!route) {
    return navigate("/home");
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

  // Update page title
  document.title = "Space Tourism | " + route.title;
}

$PRIMARY_NAV.addEventListener("click", (e) => {
  e.preventDefault();
  const target =
    e.target.tagName === "LI"
      ? (e.target = e.target.querySelector("a"))
      : e.target;

  navigate(target.getAttribute("href"));
});

// Update the UI when user navigates the session history (go back/forward)
window.onpopstate = () => updateRoute();
window.onload = () => updateRoute();
