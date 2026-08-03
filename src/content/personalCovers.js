export const personalCovers = [
  {
    color: 0x4f365f,
    id: "aubergine-arches",
    image: "assets/covers/personal/aubergine-arches.webp",
    label: { en: "Aubergine arches", fr: "Arches aubergine" },
  },
  {
    color: 0x536574,
    id: "slate-tide",
    image: "assets/covers/personal/slate-tide.webp",
    label: { en: "Slate tide", fr: "Marée ardoise" },
  },
  {
    color: 0xddd3bd,
    id: "ivory-blocks",
    image: "assets/covers/personal/ivory-blocks.webp",
    label: { en: "Ivory blocks", fr: "Blocs ivoire" },
  },
  {
    color: 0xb78336,
    id: "ochre-sun",
    image: "assets/covers/personal/ochre-sun.webp",
    label: { en: "Ochre sun", fr: "Soleil ocre" },
  },
  {
    color: 0x3f513e,
    id: "moss-folio",
    image: "assets/covers/personal/moss-folio.webp",
    label: { en: "Moss folio", fr: "Folio mousse" },
  },
  {
    color: 0xaa665c,
    id: "clay-contours",
    image: "assets/covers/personal/clay-contours.webp",
    label: { en: "Clay contours", fr: "Contours d’argile" },
  },
  {
    color: 0x183b3b,
    id: "teal-orbits",
    image: "assets/covers/personal/teal-orbits.webp",
    label: { en: "Teal orbits", fr: "Orbites sarcelle" },
  },
];

export function isPersonalCoverId(coverId) {
  return personalCovers.some((cover) => cover.id === coverId);
}

export function personalCoverById(coverId) {
  return personalCovers.find((cover) => cover.id === coverId) ?? personalCovers[0];
}

export function defaultPersonalCoverId(letterNumber, previousCoverId = "") {
  const normalized = Number.isInteger(letterNumber) && letterNumber > 0 ? letterNumber - 1 : 0;
  let index = normalized % personalCovers.length;
  if (personalCovers[index].id === previousCoverId) index = (index + 1) % personalCovers.length;
  return personalCovers[index].id;
}
