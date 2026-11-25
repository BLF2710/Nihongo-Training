// The course is in British English. These are American spellings with one clear British form; anything regional
// rather than a spelling (apartment / flat, fall / autumn) is a choice for the author and is not checked here.
// -ise is used rather than -ize (both are British, -ise is the more common): one form keeps the course consistent.
const AMERICAN_TO_BRITISH: Readonly<Record<string, string>> = {
  color: "colour", colors: "colours", colored: "coloured", colorful: "colourful",
  favorite: "favourite", favorites: "favourites",
  honor: "honour", behavior: "behaviour", neighbor: "neighbour", neighbors: "neighbours", neighborhood: "neighbourhood",
  flavor: "flavour", labor: "labour", humor: "humour", rumor: "rumour",
  center: "centre", centers: "centres", theater: "theatre", theaters: "theatres", liter: "litre", liters: "litres",
  gray: "grey",
  traveled: "travelled", traveling: "travelling", traveler: "traveller", travelers: "travellers",
  canceled: "cancelled", canceling: "cancelling", labeled: "labelled",
  organize: "organise", organized: "organised", organizes: "organises", organization: "organisation",
  realize: "realise", realized: "realised", realizes: "realises",
  recognize: "recognise", recognized: "recognised", apologize: "apologise", apologized: "apologised",
  analyze: "analyse", analyzed: "analysed",
  defense: "defence", offense: "offence", catalog: "catalogue", dialog: "dialogue", jewelry: "jewellery",
  cozy: "cosy", pajamas: "pyjamas", mom: "mum",
};

/** American spellings in `text`, each with its British form ("color → colour"). Case-insensitive, whole words. */
export function americanSpellingsIn(text: string): string[] {
  const words = text.toLowerCase().match(/[a-z]+/g) ?? [];
  return [...new Set(words.filter(word => word in AMERICAN_TO_BRITISH))].map(word => `${word} → ${AMERICAN_TO_BRITISH[word]}`);
}
