export { convertToInitials, determineCountry };

function dealWithHyphens(name?: string): string {
  if (!name) return "";
  if (name.includes("-")) {
    const nameSplit: string[] = name.split("-");
    let initials = "";
    for (const word of nameSplit) {
      if (word !== "") {
        initials += word.charAt(0).toUpperCase() + ".-";
      } else {
        initials += "-";
      }
    }
    return initials.replace(/-$/, "");
  } else {
    return name;
  }
}

function convertToInitials(name?: string): string {
  if (!name) return "";
  // Deal with parenthesis
  if (name.includes("(")) {
    name = name.substring(0, name.indexOf("("));
  }
  // Deal with CJK characters
  const regex4CJK: RegExp =
    /[\u3000-\u303F]|[\u3040-\u309F]|[\u30A0-\u30FF]|[\uFF00-\uFFEF]|[\u4E00-\u9FAF]|[\u2605-\u2606]|[\u2190-\u2195]|\u203B/g;
  if (name.match(regex4CJK)) {
    return name.replace(/[\s,.-]+/g, "").replace(/，/g, "");
  }
  // Take initials
  const nameArr: string[] = name.split(/[\s.]+/);
  let initials: string = "";
  for (const word of nameArr) {
    if (word.includes("-")) {
      initials += dealWithHyphens(word) + " ";
    } else {
      const firstLetter: string = word.charAt(0).toUpperCase();
      initials += firstLetter + ". ";
    }
  }
  return initials
    .replace(/\s.\s$/, "")
    .trim()
    .replace(/.\s-/, ".-");
}

function determineCountry(firstName: string, lastName: string): string {
  // Map of countries and their corresponding last name patterns
  const countryPatterns: { [country: string]: RegExp } = {
    en: /^[A-Za-z]{2,}$/,
    zh: /^[\u4e00-\u9fa5]{1,}$/,
    ja: /^[A-Za-z\u3040-\u309F\u30A0-\u30FF]{1,}$/,
    ko: /^[가-힣]{1,}$/,
    // Add more countries and their patterns as needed
  };

  // Iterate over the country patterns and check if any match the last name
  for (const country in countryPatterns) {
    const pattern = countryPatterns[country];
    if (pattern.test(lastName)) {
      return country;
    }
  }

  // If no country pattern matches, return "unknown"
  return "unknown";
}

// const names = [
//   "A. B. Canon D EE F. Gary-Harry I.-jack. k-Lemon. L.L. Jean-Jacques-Pierre",
//   "A. A.",
//   "Almudena",
//   "Benjamin J",
//   "Ching-Ping",
//   "Jean-Jacques-Pierre",
//   "Christopher J.",
//   "David Y.H.",
//   "J.",
//   "Joong Kee",
//   "Leo L. M.",
//   "测试",
//   "测, 试",
//   "测，试",
//   "测 试",
//   "测-试",
//   "测-test-试",
//   "Daosheng (邓道盛)",
//   "Jinkee (이진기)",
//   "Marie-Jean (陶益壮)",
// ];

// for (const name of names) {
//   console.log(name + " => " + convertToInitials(name));
// }

// console.log(names[0] + " => " + convertToInitials(names[0]));
