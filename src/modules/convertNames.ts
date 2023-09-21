export { convertToInitials };

function convertToInitials(name?: string): string {
  if (!name) return "";
  const nameArr: string[] = name.split(/[\s.-]+/);
  let initials: string = "";
  for (const nameArrEle of nameArr) {
    const word: string = nameArrEle;
    if (word.includes(".")) {
      initials += word + " ";
    } else {
      const firstLetter: string = word.charAt(0).toUpperCase();
      initials += firstLetter + ". ";
    }
  }
  return initials.replace(/\s.\s$/, "").trim();
}

// const names = [
//   "A. A.",
//   "Almudena",
//   "Benjamin J",
//   "Ching-Ping",
//   "Christopher J.",
//   "David Y.H.",
//   "J.",
//   "Joong Kee",
//   "Leo L. M.",
//   "Aaron M-mame. J.-a.",
// ];

// for (const name of names) {
//   console.log(name + " => " + convertToInitials(name));
// }
