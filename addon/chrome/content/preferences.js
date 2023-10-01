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
      document.getElementById("first_n_authors").disabled = !enabled;
    });
  }),
  updateAuthorsPreview: function () {
    const previewElement = document.getElementById(
      `zotero-prefpane-${addonRef}-authors-format-preview`,
    );
    previewElement.click();
  },
};
