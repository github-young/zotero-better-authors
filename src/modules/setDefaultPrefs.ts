import { clearPref, getPref, setPref } from "../utils/prefs";

export function setDefaultPrefSettings() {
  if (!getPref("middle_n_authors")) {
    setPref("middle_n_authors", 0);
  }

  if (!getPref("include-firstauthor-in-list")) {
    setPref("include-firstauthor-in-list", true);
  }

  if (!getPref("include-middleauthors-in-list")) {
    setPref("include-middleauthors-in-list", false);
  }

  if (!getPref("include-lastauthor-in-list")) {
    setPref("include-lastauthor-in-list", true);
  }

  if (!getPref("sep-intra-author")) {
    setPref("sep-intra-author", " ");
  }

  if (!getPref("sep-inter-author")) {
    setPref("sep-inter-author", ", ");
  }

  if (!getPref("sep-before-lastauthor")) {
    setPref("sep-before-lastauthor", "*");
  }
}
