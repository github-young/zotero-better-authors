/* eslint-disable no-undef */
/* eslint-disable require-yield */
const addonRef = "betterauthors";
const prefsPrefix = "extensions.zotero.betterauthors";
const Betterauthors = {};

Betterauthors.Preferences = {
  init: async function () {
    this.updateFirstAuthorsSettingsUI();
    this.updateAuthorsPreview();
  },
  updateFirstAuthorsSettingsUI: function () {
    setTimeout(() => {
      const enabled = Zotero.Prefs.get(
        `${prefsPrefix}.include-firstauthors-in-list`,
        true,
      );
      const inputElement = Zotero.getMainWindow().document.getElementById(
        "first_n_authors",
      );
      if (inputElement) {
        inputElement.disabled = !enabled;
      }
    });
  },
  updateAuthorsPreview: function () {
    const previewElement = Zotero.getMainWindow().document.getElementById(
      `zotero-prefpane-${addonRef}-authors-format-preview`,
    );
    if (previewElement) {
      previewElement.click();
    }
  },
};
