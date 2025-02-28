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
  updateFirstAuthorsSettingsUI: Zotero.Promise.coroutine(function* () {
    setTimeout(() => {
      const enabled = Zotero.Prefs.get(
        `${prefsPrefix}.include-firstauthors-in-list`,
        true,
      );
      Zotero.getMainWindow().document.getElementById(
        "first_n_authors",
      ).disabled = !enabled;
    });
  }),
  updateAuthorsPreview: function () {
    const previewElement = Zotero.getMainWindow().document.getElementById(
      `zotero-prefpane-${addonRef}-authors-format-preview`,
    );
    previewElement.click();
  },
};
