export const libraryCollections = [
  {
    id: "seneca-letters",
    authorId: "seneca",
    author: "Seneca",
    cover: "assets/covers/seneca-letters.webp",
    title: {
      en: "Moral Letters to Lucilius",
      fr: "Lettres à Lucilius",
    },
    description: {
      en: "A complete correspondence on time, friendship, fear, discipline, and the daily work of philosophy.",
      fr: "Une correspondance complète sur le temps, l’amitié, la peur, la discipline et le travail quotidien de la philosophie.",
    },
    matches: (reading) => reading.authorId === "seneca",
  },
  {
    id: "marcus-meditations",
    authorId: "marcus-aurelius",
    author: "Marcus Aurelius",
    cover: "assets/covers/marcus-meditations.webp",
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
    title: {
      en: "Essays & Addresses",
      fr: "Essais et discours",
    },
    description: {
      en: "Self-Reliance and a wider selection on nature, history, poetry, politics, reform, and the conduct of life.",
      fr: "Confiance en soi et un choix plus large sur la nature, l’histoire, la poésie, la politique, la réforme et la conduite de la vie.",
    },
    matches: (reading) => reading.authorId === "emerson" && reading.number >= 313,
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
