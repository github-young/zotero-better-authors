import { config } from "../../package.json";
import { getString } from "../utils/locale";
import { UIBetterAuthorsFactory } from "./betterAuthors";

export async function registerPrefsScripts(_window: Window) {
  // This function is called when the prefs window is opened
  // See addon/content/preferences.xul onpaneload
  if (!addon.data.prefs) {
    addon.data.prefs = {
      window: _window,
    };
  } else {
    addon.data.prefs.window = _window;
  }
  bindPrefEvents();

  // Initialize preferences UI
  // Call init after a short delay to ensure all elements are loaded
  setTimeout(() => {
    initPreferencesUI();
  }, 100);
}

function initPreferencesUI() {
  const enabled = Zotero.Prefs.get(
    `extensions.zotero.betterauthors.include-firstauthors-in-list`,
    true,
  );
  const inputElement = addon.data.prefs?.window.document.getElementById(
    "first_n_authors",
  ) as HTMLInputElement | null;
  if (inputElement) {
    inputElement.disabled = !enabled;
  }

  // Trigger initial preview
  updatePreview();
}

function updatePreview() {
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

  const example = UIBetterAuthorsFactory.displayCreators(exampleAuthorList);
  const previewElement = addon.data.prefs?.window.document.getElementById(
    `zotero-prefpane-${config.addonRef}-authors-format-preview`,
  );
  if (previewElement) {
    previewElement.innerHTML = example;
  }
}

function bindPrefEvents() {
  const settingsElementsList =
    addon.data.prefs!.window.document.querySelectorAll(
      `#zotero-prefpane-${config.addonRef} checkbox,input,menulist`,
    );

  for (const element of settingsElementsList) {
    element?.addEventListener("command", () => {
      updatePreview();
    });
    element?.addEventListener("change", () => {
      updatePreview();
    });
  }

  addon.data
    .prefs!.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-authors-format-preview`,
    )
    ?.addEventListener("click", () => {
      updatePreview();
    });
}
