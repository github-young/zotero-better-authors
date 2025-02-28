import { config } from "../../package.json";
import { getString } from "../utils/locale";
import { UIBetterAuthorsFactory } from "./betterAuthors";

export async function registerPrefsScripts(_window: Window) {
  // This function is called when the prefs window is opened
  // See addon/chrome/content/preferences.xul onpaneload
  if (!addon.data.prefs) {
    addon.data.prefs = {
      window: _window,
    };
  } else {
    addon.data.prefs.window = _window;
  }
  bindPrefEvents();
}

function bindPrefEvents() {
  const settingsElementsList =
    addon.data.prefs!.window.document.querySelectorAll(
      `#zotero-prefpane-${config.addonRef} checkbox,input,menulist`,
    );
  const exampleAuthorList: _ZoteroTypes.Item.Creator[] = [
    {
      creatorTypeID: 8,
      fieldMode: 0,
      firstName: "Alice",
      lastName: "Adams",
    },
    {
      creatorTypeID: 8,
      fieldMode: 0,
      firstName: "Bob",
      lastName: "Brown",
    },
    {
      creatorTypeID: 8,
      fieldMode: 0,
      firstName: "三",
      lastName: "张",
    },
    {
      creatorTypeID: 8,
      fieldMode: 0,
      firstName: "四",
      lastName: "李",
    },
  ];
  for (const element of settingsElementsList) {
    element?.addEventListener("command", (e) => {
      const example = UIBetterAuthorsFactory.displayCreators(exampleAuthorList);
      addon.data.prefs!.window.document.getElementById(
        `zotero-prefpane-${config.addonRef}-authors-format-preview`,
      )!.innerHTML = example;
    });
    element?.addEventListener("change", (e) => {
      const example = UIBetterAuthorsFactory.displayCreators(exampleAuthorList);
      addon.data.prefs!.window.document.getElementById(
        `zotero-prefpane-${config.addonRef}-authors-format-preview`,
      )!.innerHTML = example;
    });
  }
  addon.data
    .prefs!.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-authors-format-preview`,
    )
    ?.addEventListener("click", (e) => {
      const example = UIBetterAuthorsFactory.displayCreators(exampleAuthorList);
      addon.data.prefs!.window.document.getElementById(
        `zotero-prefpane-${config.addonRef}-authors-format-preview`,
      )!.innerHTML = example;
    });
}
