/**
 * Appends a context menu item when the `#context-menu` element is attached to the event target.
 *
 * @param {Event} event - The event triggering the function.
 * @param {string} name - The name of the context menu item.
 * @param {string} icon - The FontAwesome icon class to be used in the menu item.
 */
async function appendContextItem(event, name, icon) {
  const targetElement = event.target;
  const existingMenu = targetElement.querySelector("#context-menu");

  const createMenuItem = (menu) => {
    if (!menu.querySelector(".context-item.barbrawl-profiles")) {
      const listItem = document.createElement("li");
      listItem.className = "context-item barbrawl-profiles";
      listItem.innerHTML = `<i class="fa-solid ${icon}"></i> ${name}`;
      listItem.addEventListener("click", () =>
        console.log(`Clicked on ${name}`)
      );
      menu.querySelector("ol.context-items")?.appendChild(listItem);
    }
  };

  if (existingMenu) return createMenuItem(existingMenu);

  let timeoutId = setTimeout(() => observer.disconnect(), 3000);

  const observer = new MutationObserver((mutations, observer) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node.id === "context-menu") {
          createMenuItem(node);
          clearTimeout(timeoutId);
          observer.disconnect();
        }
      });
    }
  });

  observer.observe(targetElement, { childList: true });
}

/**
 * A hook event function that fires when a TokenConfig is rendered.
 * @param {Application} app - The TokenConfig application instance.
 * @param {jQuery} $html - The jQuery object containing the rendered HTML.
 * @param {Object} data - Additional data passed to the render function.
 */
export default function onRenderTokenConfig(app, [html], data) {
  const resourcesTab = html.querySelector(
    ".app.token-sheet div[data-tab='resources']"
  );
  if (!resourcesTab) return;

  resourcesTab.addEventListener("click", (event) => {
    const buttonMap = {
      ".brawlbar-save": ["Export Profile", "fa-file-export"],
      ".brawlbar-load": ["Import Profile", "fa-file-import"],
    };

    for (const [selector, [name, icon]] of Object.entries(buttonMap)) {
      if (event.target.closest(selector))
        return appendContextItem(event, name, icon);
    }
  });
}
