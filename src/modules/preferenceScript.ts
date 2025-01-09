import { config } from "../../package.json";
import { getString } from "../utils/locale";
import { UIBetterAuthorsFactory } from "./betterAuthors";

export async function registerPrefsScripts(_window: Window) {
  // This function is called when the prefs window is opened
  // See addon/chrome/content/preferences.xul onpaneload
  if (!addon.data.prefs) {
    addon.data.prefs = {
      window: _window,
      columns: [
        {
          dataKey: "title",
          label: getString("prefs-table-title"),
          fixedWidth: true,
          width: 100,
        },
        {
          dataKey: "detail",
          label: getString("prefs-table-detail"),
        },
      ],
      rows: [
        {
          title: "Orange",
          detail: "It's juicy",
        },
      ],
    };
  } else {
    addon.data.prefs.window = _window;
  }
  //   updatePrefsUI();
  bindPrefEvents();
}

async function updatePrefsUI() {
  // You can initialize some UI elements on prefs window
  // with addon.data.prefs.window.document
  // Or bind some events to the elements
  const renderLock = ztoolkit.getGlobal("Zotero").Promise.defer();
  if (addon.data.prefs?.window == undefined) return;
  const tableHelper = new ztoolkit.VirtualizedTable(addon.data.prefs?.window)
    .setContainerId(`${config.addonRef}-table-container`)
    .setProp({
      id: `${config.addonRef}-prefs-table`,
      // Do not use setLocale, as it modifies the Zotero.Intl.strings
      // Set locales directly to columns
      columns: addon.data.prefs?.columns,
      showHeader: true,
      multiSelect: true,
      staticColumns: true,
      disableFontSizeScaling: true,
    })
    .setProp("getRowCount", () => addon.data.prefs?.rows.length || 0)
    .setProp(
      "getRowData",
      (index) =>
        addon.data.prefs?.rows[index] || {
          title: "no data",
          detail: "no data",
        },
    )
    // Show a progress window when selection changes
    .setProp("onSelectionChange", (selection) => {
      new ztoolkit.ProgressWindow(config.addonName)
        .createLine({
          text: `Selected line: ${addon.data.prefs?.rows
            .filter((v, i) => selection.isSelected(i))
            .map((row) => row.title)
            .join(",")}`,
          progress: 100,
        })
        .show();
    })
    // When pressing delete, delete selected line and refresh table.
    // Returning false to prevent default event.
    .setProp("onKeyDown", (event: KeyboardEvent) => {
      if (event.key == "Delete" || (Zotero.isMac && event.key == "Backspace")) {
        addon.data.prefs!.rows =
          addon.data.prefs?.rows.filter(
            (v, i) => !tableHelper.treeInstance.selection.isSelected(i),
          ) || [];
        tableHelper.render();
        return false;
      }
      return true;
    })
    // For find-as-you-type
    .setProp(
      "getRowString",
      (index) => addon.data.prefs?.rows[index].title || "",
    )
    // Render the table.
    .render(-1, () => {
      renderLock.resolve();
    });
  await renderLock.promise;
  ztoolkit.log("Preference table rendered!");
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
