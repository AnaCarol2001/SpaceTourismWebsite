const $NAV = document.querySelector(".primary-nav");
const $NAV_TOGGLE = document.querySelector(".mobile-nav-toggle");

$NAV_TOGGLE.addEventListener("click", () => {
  const VISIBLITY = $NAV.dataset.visible;

  if (VISIBLITY === "false") {
    $NAV.dataset.visible = true;
    $NAV_TOGGLE.ariaExpanded = true;
  } else {
    $NAV.dataset.visible = false;
    $NAV_TOGGLE.ariaExpanded = false;
  }
});
