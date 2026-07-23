import { letters } from "./letters.js";
import { marcusAtDawn, marcusReadings } from "./marcus.js";
import { emersonReadings } from "./emerson.js";

const senecaReadings = letters.map((letter) => ({
  ...letter,
  author: "Seneca",
  authorId: "seneca",
  work: {
    en: "Moral Letters to Lucilius",
    fr: "Lettres à Lucilius",
  },
}));

export const epictetusOnControl = {
  number: 202,
  author: "Epictetus",
  authorId: "epictetus",
  work: {
    en: "The Enchiridion",
    fr: "Manuel d’Épictète",
  },
  code: {
    en: "MANUAL · I",
    fr: "MANUEL · I",
  },
  sources: {
    en: "https://en.wikisource.org/wiki/All_the_Works_of_Epictetus,_Which_Are_Now_Extant/The_Encheiridion",
    fr: "https://fr.wikisource.org/wiki/Manuel_d%E2%80%99%C3%89pict%C3%A8te_(trad._Guyau)/Texte_entier",
  },
  en: {
    title: "What Is in Our Control",
    preview: "Some things are in our control and others are not. Our opinions, pursuits, desires, aversions, and actions belong to us.",
    text: [
      "Some things are in our control and others not. Things in our control are opinion, pursuit, desire, aversion, and, in a word, whatever are our own actions.",
      "Things not in our control are body, property, reputation, command, and, in one word, whatever are not our own actions.",
      "The things in our control are by nature free, unrestrained, unhindered; but those not in our control are weak, slavish, restrained, belonging to others.",
      "Remember, then, that if you suppose things which are slavish by nature to be free, and things belonging to others to be your own, you will be hindered. You will lament, you will be disturbed, and you will find fault both with gods and people.",
      "But if you suppose only that to be your own which is your own, and what belongs to others such as it really is, then no one will ever compel you or restrain you. You will find fault with no one. You will accuse no one. You will do nothing against your will. No one will hurt you, and you will have no enemy, for you will not suffer any harm.",
    ],
    translationNote: "Public-domain translation by Elizabeth Carter, via Wikisource.",
    essentialIdea: "Peace begins by separating your judgments and actions from outcomes, possessions, and other people’s opinions.",
    practice: "Name one concern. Write two short lines: what belongs to your choice, and what does not.",
    tension: "The distinction protects attention, but it does not excuse passivity. Your response remains yours even when the outcome does not.",
    prompt: "What are you trying to control that was never yours to command?",
    placeholder: "Dear Epictetus,\n\nToday I can govern…",
    notes: [
      {
        id: "prohairesis",
        phrase: "whatever are our own actions",
        label: "Moral choice",
        latin: "prohairesis",
        definition: "The faculty by which we judge, assent, refuse, and choose how to act.",
        context: "Epictetus places freedom in the use of this faculty, not in control over events.",
      },
    ],
  },
  fr: {
    title: "Ce qui dépend de nous",
    preview: "Parmi les choses, les unes dépendent de nous, les autres n’en dépendent pas. L’opinion, le vouloir, le désir, l’aversion et nos œuvres nous appartiennent.",
    text: [
      "Parmi les choses, les unes dépendent de nous, les autres n’en dépendent pas. Celles qui dépendent de nous, c’est l’opinion, le vouloir, le désir, l’aversion : en un mot tout ce qui est notre œuvre.",
      "Celles qui ne dépendent pas de nous, c’est le corps, les biens, la réputation, les dignités : en un mot tout ce qui n’est pas notre œuvre.",
      "Les choses qui dépendent de nous sont libres par leur nature ; nul ne peut ni les arrêter, ni leur faire obstacle. Celles qui ne dépendent pas de nous sont faibles, esclaves, dépendantes, sujettes à mille obstacles et à mille inconvénients, et entièrement étrangères.",
      "Souviens-toi donc que, si tu crois libres les choses qui de leur nature sont esclaves, et propres à toi celles qui dépendent d’autrui, tu rencontreras à chaque pas des obstacles ; tu seras affligé, troublé, et tu te plaindras des dieux et des hommes.",
      "Mais si tu crois tien ce qui t’appartient en propre, et étranger ce qui est à autrui, jamais personne ne te forcera à faire ce que tu ne veux point, ni ne t’empêchera de faire ce que tu veux. Tu n’accuseras personne, tu ne te plaindras de personne ; tu ne feras rien, pas même la plus petite chose, malgré toi ; personne ne te fera aucun mal, et tu n’auras point d’ennemi, car il ne t’arrivera rien de nuisible.",
    ],
    translationNote: "Traduction du domaine public par Jean-Marie Guyau, via Wikisource.",
    essentialIdea: "La paix commence par la distinction entre vos jugements et vos actes, d’une part, et les résultats, les biens et l’opinion d’autrui, d’autre part.",
    practice: "Nommez une inquiétude. Écrivez deux lignes : ce qui relève de votre choix, puis ce qui n’en relève pas.",
    tension: "Cette distinction protège l’attention, mais elle n’autorise pas la passivité. Votre réponse reste vôtre même quand le résultat ne l’est pas.",
    prompt: "Que cherchez-vous à contrôler alors que cela ne vous a jamais appartenu ?",
    placeholder: "Cher Épictète,\n\nAujourd’hui, je peux gouverner…",
    notes: [
      {
        id: "prohairesis",
        phrase: "tout ce qui est notre œuvre",
        label: "Choix moral",
        latin: "prohairesis",
        definition: "La faculté par laquelle nous jugeons, consentons, refusons et choisissons notre manière d’agir.",
        context: "Épictète place la liberté dans l’usage de cette faculté, et non dans la maîtrise des événements.",
      },
    ],
  },
};

export const readings = [
  ...senecaReadings,
  ...marcusReadings,
  epictetusOnControl,
  ...emersonReadings,
];

export const voices = [
  {
    id: "seneca",
    name: "Seneca",
    reading: 1,
    works: 124,
  },
  {
    id: "marcus-aurelius",
    name: "Marcus Aurelius",
    reading: marcusAtDawn.number,
    works: marcusReadings.length,
  },
  {
    id: "epictetus",
    name: "Epictetus",
    reading: epictetusOnControl.number,
    works: 1,
  },
  {
    id: "emerson",
    name: "Ralph Waldo Emerson",
    reading: emersonReadings[0].number,
    works: emersonReadings.length,
  },
];

export const requestedVoices = [
  { id: "thoreau", name: "Henry David Thoreau", status: "edition-review" },
  { id: "meister-eckhart", name: "Meister Eckhart", status: "edition-review" },
  { id: "saint-augustine", name: "Saint Augustine", status: "edition-review" },
  { id: "marsilio-ficino", name: "Marsilio Ficino", status: "edition-review" },
  { id: "simone-weil", name: "Simone Weil", status: "translation-review" },
  { id: "pierre-hadot", name: "Pierre Hadot", status: "guide-only" },
];

export function getReading(number) {
  return readings.find((reading) => reading.number === Number(number)) ?? readings[0];
}

export function readingCode(reading, locale) {
  return reading.code?.[locale] ?? null;
}
