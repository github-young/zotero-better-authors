import { config } from "../../package.json";
import { getString } from "../utils/locale";
import { convertToInitials, determineCountry } from "./convertNames";
import { getPref } from "../utils/prefs";

function betterAuthorsPlugin(
  target: any,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
) {
  const original = descriptor.value;
  descriptor.value = function (...args: any) {
    try {
      ztoolkit.log(`Calling last author ${target.name}.${String(propertyKey)}`);
      return original.apply(this, args);
    } catch (e) {
      ztoolkit.log(
        `Error in last author ${target.name}.${String(propertyKey)}`,
        e,
      );
      throw e;
    }
  };
  return descriptor;
}

export class BasicBetterAuthorsFactory {
  @betterAuthorsPlugin
  static registerPrefs() {
    const prefOptions = {
      pluginID: config.addonID,
      src: rootURI + "content/preferences.xhtml",
      scripts: [rootURI + "content/preferences.js"],
      label: getString("prefs-title"),
      image: `chrome://${config.addonRef}/content/icons/favicon.png`,
      defaultXUL: true,
    };
    Zotero.PreferencePanes.register(prefOptions);
  }
}

type NameOrderType = "firstlast" | "lastfirst";

export class UIBetterAuthorsFactory {
  static getAuthorNameWithNameOrder(
    nameorder: NameOrderType,
    firstName: string,
    lastName: string,
    separator: string,
  ): string {
    const firstnameStyle: string = getPref("firstnamestyle");
    let firstnameAsInitials: boolean = false;
    if (firstnameStyle === "initials") {
      firstnameAsInitials = true;
    }
    if (nameorder === "firstlast") {
      if (firstnameAsInitials) {
        return convertToInitials(firstName) + separator + lastName;
      } else {
        return firstName + separator + lastName;
      }
    } else if (nameorder === "lastfirst") {
      if (firstnameAsInitials) {
        return lastName + separator + convertToInitials(firstName);
      } else {
        return lastName + separator + firstName;
      }
    } else {
      throw new Error(`Invalid author name order: ${nameorder}.`);
    }
  }
  static displayAuthorName(
    authors: _ZoteroTypes.Item.Creator[],
    index: number,
    sep: string = " ",
    sepCJK: string = "",
  ): string {
    if (authors.length == 0) return "";
    const targetAuthor = authors[index];
    const firstName = targetAuthor.firstName;
    const lastName = targetAuthor.lastName;
    // BasicTool.getZotero().log(targetAuthor.fieldMode)
    if (targetAuthor.fieldMode == 0) {
      // Double fields mode
      const firstnameStyle: string = getPref("firstnamestyle");
      let firstnameAsNone: boolean = false;
      if (firstnameStyle === "none") {
        firstnameAsNone = true;
      }
      if (firstnameAsNone) {
        return targetAuthor.lastName;
      } else {
        const nameCountry = determineCountry(firstName, lastName);
        const nameOrderStyle = getPref("namestyle");
        let nameorder: NameOrderType = "firstlast";
        let separator = sep;
        if (["zh", "ja", "ko"].includes(nameCountry)) {
          separator = sepCJK;
        } else {
          separator = sep;
        }
        if (nameOrderStyle === "auto") {
          // BasicTool.getZotero().log(nameCountry);
          if (["zh", "ja", "ko"].includes(nameCountry)) {
            nameorder = "lastfirst";
          } else {
            nameorder = "firstlast";
          }
        } else if (nameOrderStyle === "firstlast") {
          nameorder = "firstlast";
        } else if (nameOrderStyle === "lastfirst") {
          nameorder = "lastfirst";
        } else {
          throw new Error(
            `Invalid author name order setting: ${nameOrderStyle}.`,
          );
        }
        return this.getAuthorNameWithNameOrder(
          nameorder,
          firstName,
          lastName,
          separator,
        );
      }
    } else {
      // Single field mode should be used to institutions. Only lastName field has value.
      return targetAuthor.lastName;
    }
  }

  static displayCreators(
    creators: _ZoteroTypes.Item.Creator[],
    filterType: string = "author",
  ) {
    // Only get all authors in the creators
    const authors = creators.filter(
      (creator) =>
        creator.creatorTypeID === Zotero.CreatorTypes.getID(filterType),
    );
    if (authors.length == 0) return "";
    // const sep = this.getSeparator("sep");
    const separators: string[] = [];
    const sepIntra: string = getPref("sep-intra-author");
    const sepIntraCJK: string = getPref("sep-intra-author-cjk");
    const sepInter: string = getPref("sep-inter-author");
    const sepOmitted: string = getPref("sep-omitted-authors");
    const indicatorLastAuthor: string = getPref("indicator-for-lastauthor");
    const indicatorPosition: string = getPref("indicator-position");
    // get first n authors
    // Initialize the first author list
    const firstAuthorsList: string[] = [];
    const includeFirstAuthorsFlag = getPref("include-firstauthors-in-list");
    let firstN = 0;
    if (includeFirstAuthorsFlag) {
      const firstAuthorNumber = getPref("first_n_authors");
      if (firstAuthorNumber !== undefined) {
        firstN = firstAuthorNumber as number;
      }
      // deal with only one author
      if (authors.length === 1) {
        const authorDisplayed: string = this.displayAuthorName(
          authors,
          0,
          sepIntra,
          sepIntraCJK,
        );
        firstAuthorsList.push(authorDisplayed);
      } else {
        // here: length -1 means excluding the last author
        for (let i = 0; i <= authors.length - 2; i++) {
          // firstN === 0 is for all first authors
          if (i < firstN || firstN === 0) {
            const authorDisplayed: string = this.displayAuthorName(
              authors,
              i,
              sepIntra,
              sepIntraCJK,
            );
            firstAuthorsList.push(authorDisplayed);
          } else {
            break;
          }
        }
      }
    }
    // get last author
    const includeLastAuthorFlag = getPref("include-lastauthor-in-list");
    let lastAuthorDisplayed: string = "";
    if (includeLastAuthorFlag) {
      lastAuthorDisplayed = this.displayAuthorName(
        authors,
        authors.length - 1,
        sepIntra,
        sepIntraCJK,
      );
    }
    // Output
    let displayedString: string = "";
    const authorsList: string[] = [];
    // [firsts], if any
    if (includeFirstAuthorsFlag) {
      authorsList.push(...firstAuthorsList);
      displayedString += authorsList.join(sepInter);
    }
    // [last], if any
    let lastAuthorWithIndicator: string = "";
    if (indicatorPosition === "before") {
      lastAuthorWithIndicator = indicatorLastAuthor + lastAuthorDisplayed;
    } else {
      lastAuthorWithIndicator = lastAuthorDisplayed + indicatorLastAuthor;
    }
    if (includeLastAuthorFlag) {
      if (!displayedString) {
        displayedString += lastAuthorWithIndicator;
      } else if (displayedString == lastAuthorDisplayed) {
        // in case of only one author
        displayedString = lastAuthorWithIndicator;
      } else {
        if (firstN > 0 && firstN <= authors.length - 2) {
          displayedString += sepInter + sepOmitted + sepInter;
        } else {
          displayedString += sepInter;
        }
        displayedString += lastAuthorWithIndicator;
      }
    } else {
      if (authors.length >= 2) {
        let sepEtAl: string = "et al.";
        //   BasicTool.getZotero().log(Zotero.locale);
        if (Zotero.locale === "zh-CN") {
          sepEtAl = "等";
        }
        if (includeFirstAuthorsFlag) {
          displayedString += sepInter + sepEtAl;
        }
      }
    }
    return displayedString;
  }

  @betterAuthorsPlugin
  static async registerExtraColumn() {
    await Zotero.ItemTreeManager.registerColumn({
      dataKey: "firstauthor",
      label: getString("itemtree-firstauthor-title"),
      pluginID: config.addonID,
      flex: 0.8,
      dataProvider: (
        item: Zotero.Item | Zotero.Collection,
        dataKey: string,
      ): string => {
        if (!(item instanceof Zotero.Item)) return "";
        const creators = item.getCreators();
        // Only get all authors in the creators
        const authors = creators.filter(
          (creator) => creator.creatorTypeID === 8,
        );
        if (authors.length == 0) return "";
        const sepIntra = getPref("sep-intra-author");
        const sepIntraCJK = getPref("sep-intra-author-cjk");
        const firstAuthorDisplayed: string = this.displayAuthorName(
          authors,
          0,
          sepIntra,
          sepIntraCJK,
        );
        return firstAuthorDisplayed;
      },
      renderCell(index: number, data: string, column) {
        const span = Zotero.getMainWindow().document.createElementNS(
          "http://www.w3.org/1999/xhtml",
          "span",
        );
        span.className = `cell ${column.className}`;
        // span.style.background = "#0dd068";
        span.innerText = data;
        return span;
      },
    });
    await Zotero.ItemTreeManager.registerColumn({
      dataKey: "lastauthor",
      label: getString("itemtree-lastauthor-title"),
      pluginID: config.addonID,
      flex: 0.8,
      dataProvider: (
        item: Zotero.Item | Zotero.Collection,
        dataKey: string,
      ): string => {
        if (!(item instanceof Zotero.Item)) return "";
        const creators = item.getCreators();
        const itemType = item.itemType;
        let lastAuthorDisplayed: string = "";

        if (itemType === "thesis") {
          // Get the first contributor for thesis
          const contributors = creators.filter(
            (creator) => creator.creatorTypeID !== 8,
          );
          if (contributors.length > 0) {
            const sepIntra = getPref("sep-intra-author");
            const sepIntraCJK = getPref("sep-intra-author-cjk");
            lastAuthorDisplayed = this.displayAuthorName(
              contributors,
              0,
              sepIntra,
              sepIntraCJK,
            );
          }
        } else {
          // Only get all authors in the creators
          const authors = creators.filter(
            (creator) => creator.creatorTypeID === 8,
          );
          if (authors.length > 0) {
            const sepIntra = getPref("sep-intra-author");
            const sepIntraCJK = getPref("sep-intra-author-cjk");
            lastAuthorDisplayed = this.displayAuthorName(
              authors,
              authors.length - 1,
              sepIntra,
              sepIntraCJK,
            );
          }
        }

        return lastAuthorDisplayed;
      },
      renderCell(index: number, data: string, column) {
        const span = Zotero.getMainWindow().document.createElementNS(
          "http://www.w3.org/1999/xhtml",
          "span",
        );
        span.className = `cell ${column.className}`;
        // span.style.background = "#0dd068";
        span.innerText = data;
        return span;
      },
    });
    await Zotero.ItemTreeManager.registerColumn({
      dataKey: "authors",
      label: getString("itemtree-authors-title"),
      pluginID: config.addonID,
      flex: 0.8,
      dataProvider: (
        item: Zotero.Item | Zotero.Collection,
        dataKey: string,
      ): string => {
        if (!(item instanceof Zotero.Item)) return "";
        const creators = item.getCreators();
        return this.displayCreators(creators);
      },
      renderCell(index: number, data: string, column) {
        const span = Zotero.getMainWindow().document.createElementNS(
          "http://www.w3.org/1999/xhtml",
          "span",
        );
        span.className = `cell ${column.className}`;
        // span.style.background = "#0dd068";
        span.innerText = data;
        return span;
      },
    });
  }
}
