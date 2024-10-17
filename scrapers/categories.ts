const categories = [
  { name: "Osnovne namirnice", keywords: ["mlijeko", "brašno", "ulje", "šećer", "sol", "tjestenina"] },
  {
    name: "Jaja",
    keywords: ["jaja"],
  },
  {
    name: "Meso i mesne prerađevine",
    keywords: [
      "meso",
      "lopatica",
      "šunka",
      "rebra",
      "prsa",
      "batak",
      "hrenovke",
      "hrenovka",
      "pašteta",
      "lopatice",
      "but",
      "salama",
      "kobasica",
      "kulen",
      "vratina",
      "slanina",
      "ražnjići",
      "vrat",
      "mesa",
      "mesni",
      "pečenica",
      "file",
      "buncek",
      "vršci",
      "jeger",
      "zabatak",
    ],
  },
  { name: "Riba", keywords: ["oslić"] },
  { name: "Mlijeko i mlječni proizvodi", keywords: ["mlijeko", "jogurt", "kefir", "sir", "vrhnje", "maslac"] },
  { name: "Voće", keywords: ["banana", "jabuka", "avokado", "naranča", "limun"] },
  { name: "Povrće", keywords: ["rajčica", "paprika", "luk", "cvjetača", "kupus", "poriluk"] },
  { name: "Grickalice", keywords: ["čips", "napolitanke", "badem", "štapići"] },
  { name: "Orašasti plodovi", keywords: ["badem"] },
  { name: "Bezalkoholna pića", keywords: ["cola", "voda", "cedevita"] },
  { name: "Alkoholna pića", keywords: ["gin", "pelinkovac"] },
  { name: "Pivo", keywords: ["pivo"] },
  { name: "Kava", keywords: ["kava"] },
  { name: "Kozmetika", keywords: ["dezodorans", "balzam", "gel za brijanje", "gel za tuširanje"] },
  { name: "Pranje i njega rublja", keywords: ["omekšivač"] },
  { name: "Brašno", keywords: ["brašno"] },
  { name: "Ulje", keywords: ["ulje"] },
  { name: "Kaše i krupice", keywords: ["palenta"] },
  { name: "Kečap, senf, majoneza", keywords: ["kečap", "senf", "majoneza"] },
  { name: "Gotova jela", keywords: ["štrukli"] },
];

export const getCategories = (name: string) => {
  const nameLower = name.toLowerCase();
  return categories
    .filter((c) =>
      c.keywords.some((k) => nameLower.includes(k + " ") || nameLower.includes(" " + k) || nameLower.startsWith(k))
    )
    .map((c) => c.name);
};
