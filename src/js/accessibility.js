/**
 * It takes a tab list element and adds the possibility of using the arrow keys to navigate instead of the tab key.
 * @param {Element} tabList
 */
export default function tabAccessibility(tabList) {
  tabList
    .querySelectorAll("li")
    .forEach((li) => li.setAttribute("role", "presentation"));

  tabList.querySelectorAll("a").forEach((tab, index) => {
    tab.setAttribute("role", "tab");
    if (index === 0) {
      tab.setAttribute("aria-selected", "true");
    } else {
      tab.setAttribute("tabindex", "-1");
    }
  });

  tabList.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowLeft":
        moveLeft(tabList);
        break;
      case "ArrowRight":
        moveRight(tabList);
        break;
      case "Home":
        e.preventDefault();
        tabList.firstElementChild.querySelector("a").click();
        break;
      case "End":
        e.preventDefault();
        tabList.lastElementChild.querySelector("a").click();
        break;
      default:
        break;
    }
  });
}

function moveLeft(tabList) {
  const currentTab = document.activeElement;
  if (!currentTab.parentElement.previousElementSibling) {
    tabList.lastElementChild.querySelector("a").click();
  } else {
    currentTab.parentElement.previousElementSibling.querySelector("a").click();
  }
}

function moveRight(tabList) {
  const currentTab = document.activeElement;
  if (!currentTab.parentElement.nextElementSibling) {
    tabList.firstElementChild.querySelector("a").click();
  } else {
    currentTab.parentElement.nextElementSibling.querySelector("a").click();
  }
}

/**
 * Configures the skip to content
 */
export function jumpToContent(e) {
  e.preventDefault();
  const jumpToContent = document.querySelector(
    `${e.target.getAttribute("href")}`
  );
  jumpToContent.setAttribute("tabindex", "-1");

  let y = jumpToContent.getBoundingClientRect().top + window.scrollY - 15;
  window.scrollTo(0, y);
  jumpToContent.focus();
}
