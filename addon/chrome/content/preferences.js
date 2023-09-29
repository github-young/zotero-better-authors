const prefsPrefix = "extensions.zotero.betterauthors";
const Betterauthors = {};

Betterauthors.Preferences = {
    init: async function () {
        this.updateMiddleAuthorsSettingsUI();
    },
    updateMiddleAuthorsSettingsUI: Zotero.Promise.coroutine(function* () {
        setTimeout(() => {
            const enabled = Zotero.Prefs.get(`${prefsPrefix}.include-middleauthors-in-list`, true);
            document.getElementById('middle_n_authors').disabled = !enabled;
        });
    }),
}