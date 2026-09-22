export const libraryCollections = [
  {
    id: "seneca-letters",
    authorId: "seneca",
    author: "Seneca",
    cover: "assets/covers/seneca-letters.webp",
    coverColor: 0x9a432d,
    title: {
      en: "Moral Letters to Lucilius",
      fr: "Lettres à Lucilius",
    },
    description: {
      en: "A complete correspondence on time, friendship, fear, discipline, and the daily work of philosophy.",
      fr: "Une correspondance complète sur le temps, l’amitié, la peur, la discipline et le travail quotidien de la philosophie.",
    },
    matches: (reading) => reading.authorId === "seneca" && reading.number <= 124,
  },
  {
    id: "seneca-shortness-life",
    authorId: "seneca",
    author: "Seneca",
    cover: "assets/covers/seneca-shortness-life.webp",
    coverColor: 0x8f3f31,
    title: { en: "On the Shortness of Life", fr: "De la brièveté de la vie" },
    description: {
      en: "A complete dialogue on time, delay, and the difference between duration and a life fully used.",
      fr: "Un dialogue intégral sur le temps, le retard et la différence entre la durée et une vie pleinement employée.",
    },
    matches: (reading) => reading.number === 401,
  },
  {
    id: "seneca-peace-mind",
    authorId: "seneca",
    author: "Seneca",
    cover: "assets/covers/seneca-peace-mind.webp",
    coverColor: 0x40504d,
    title: { en: "Of Peace of Mind", fr: "De la tranquillité de l’âme" },
    description: {
      en: "A complete dialogue on steadiness, useful work, measured rest, and the unsettled mind.",
      fr: "Un dialogue intégral sur la stabilité, le travail utile, le repos mesuré et l’esprit inquiet.",
    },
    matches: (reading) => reading.number === 402,
  },
  {
    id: "seneca-happy-life",
    authorId: "seneca",
    author: "Seneca",
    cover: "assets/covers/seneca-happy-life.webp",
    coverColor: 0x9a6e2d,
    title: { en: "Of a Happy Life", fr: "De la vie heureuse" },
    description: {
      en: "A complete dialogue on virtue, pleasure, fortune, and the grounds of a good life.",
      fr: "Un dialogue intégral sur la vertu, le plaisir, la fortune et les fondements d’une vie bonne.",
    },
    matches: (reading) => reading.number === 403,
  },
  {
    id: "seneca-anger",
    authorId: "seneca",
    author: "Seneca",
    cover: "assets/covers/seneca-anger.webp",
    coverColor: 0x7c3025,
    title: { en: "Of Anger", fr: "De la colère" },
    description: {
      en: "Three complete books on anger’s beginnings, disguises, consequences, and remedies.",
      fr: "Trois livres intégraux sur les débuts, les masques, les conséquences et les remèdes de la colère.",
    },
    matches: (reading) => reading.number >= 405 && reading.number <= 407,
  },
  {
    id: "seneca-providence",
    authorId: "seneca",
    author: "Seneca",
    cover: "assets/covers/seneca-providence.webp",
    coverColor: 0x4f3f65,
    title: { en: "Of Providence", fr: "De la Providence" },
    description: {
      en: "A complete dialogue on adversity, moral testing, fate, and the discipline of character.",
      fr: "Un dialogue intégral sur l’adversité, l’épreuve morale, le destin et la discipline du caractère.",
    },
    matches: (reading) => reading.number === 404,
  },
  {
    id: "seneca-benefits",
    authorId: "seneca",
    author: "Seneca",
    cover: "assets/covers/seneca-benefits.webp",
    coverColor: 0x32635d,
    title: { en: "On Benefits", fr: "Des bienfaits" },
    description: {
      en: "Seven complete books on giving, receiving, gratitude, obligation, and generosity without account.",
      fr: "Sept livres intégraux sur le don, la réception, la gratitude, l’obligation et la générosité sans calcul.",
    },
    matches: (reading) => reading.number >= 408 && reading.number <= 414,
  },
  {
    id: "marcus-meditations",
    authorId: "marcus-aurelius",
    author: "Marcus Aurelius",
    cover: "assets/covers/marcus-meditations.webp",
    coverColor: 0x192842,
    title: {
      en: "Meditations",
      fr: "Pensées pour moi-même",
    },
    description: {
      en: "Twelve books of private reminders on attention, duty, change, and life in accord with nature.",
      fr: "Douze livres de rappels privés sur l’attention, le devoir, le changement et une vie conforme à la nature.",
    },
    matches: (reading) => reading.authorId === "marcus-aurelius",
  },
  {
    id: "epictetus-enchiridion",
    authorId: "epictetus",
    author: "Epictetus",
    cover: "assets/covers/epictetus-enchiridion.webp",
    coverColor: 0x68704a,
    title: {
      en: "The Enchiridion",
      fr: "Manuel d’Épictète",
    },
    description: {
      en: "A compact manual for distinguishing our choices from everything that does not belong to us.",
      fr: "Un manuel concis pour distinguer nos choix de tout ce qui ne nous appartient pas.",
    },
    matches: (reading) => reading.authorId === "epictetus",
  },
  {
    id: "emerson-society-solitude",
    authorId: "emerson",
    author: "Ralph Waldo Emerson",
    cover: "assets/covers/emerson-society-solitude.webp",
    coverColor: 0x9b5522,
    title: {
      en: "Society and Solitude",
      fr: "Société et Solitude",
    },
    description: {
      en: "Twelve essays on keeping an independent mind while living, speaking, and working among others.",
      fr: "Douze essais sur l’indépendance de l’esprit dans la vie, la parole et le travail parmi les autres.",
    },
    matches: (reading) => reading.authorId === "emerson" && reading.number >= 301 && reading.number <= 312,
  },
  {
    id: "emerson-self-reliance",
    authorId: "emerson",
    author: "Ralph Waldo Emerson",
    cover: "assets/covers/emerson-self-reliance.webp",
    coverColor: 0x24221f,
    title: {
      en: "Self-Reliance",
      fr: "Confiance en soi",
    },
    description: {
      en: "The complete essay on inward conviction, conformity, responsibility, and direct relation to reality.",
      fr: "L’essai intégral sur la conviction intérieure, le conformisme, la responsabilité et le rapport direct au réel.",
    },
    matches: (reading) => reading.number === 313,
  },
  {
    id: "thoreau-walden",
    authorId: "thoreau",
    author: "Henry David Thoreau",
    cover: "assets/covers/thoreau-walden.webp",
    coverColor: 0x284d46,
    title: { en: "Walden", fr: "Walden ou la vie dans les bois" },
    description: {
      en: "All eighteen chapters of Thoreau’s experiment in deliberate living beside Walden Pond.",
      fr: "Les dix-huit chapitres de l’expérience de vie délibérée menée par Thoreau au bord de l’étang de Walden.",
    },
    matches: (reading) => reading.authorId === "thoreau",
  },
];

export function collectionById(collectionId) {
  return libraryCollections.find((collection) => collection.id === collectionId) ?? libraryCollections[0];
}

export function collectionsForAuthor(authorId) {
  return authorId === "all"
    ? libraryCollections
    : libraryCollections.filter((collection) => collection.authorId === authorId);
}

export function readingsForCollection(collectionId, readings) {
  const collection = collectionById(collectionId);
  return readings.filter(collection.matches);
}

export function readingsForWork(authorId, workTitle, readings) {
  return readings.filter((reading) => (
    reading.authorId === authorId && reading.work.en === workTitle
  ));
}
