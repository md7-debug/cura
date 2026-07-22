import { letters } from "./letters.js";

const senecaReadings = letters.map((letter) => ({
  ...letter,
  author: "Seneca",
  authorId: "seneca",
  work: {
    en: "Moral Letters to Lucilius",
    fr: "Lettres à Lucilius",
  },
}));

export const marcusAtDawn = {
  number: 201,
  author: "Marcus Aurelius",
  authorId: "marcus-aurelius",
  work: {
    en: "Meditations",
    fr: "Pensées pour moi-même",
  },
  code: {
    en: "BOOK II · I",
    fr: "LIVRE II · I",
  },
  sources: {
    en: "https://www.gutenberg.org/cache/epub/6920/pg6920-images.html",
    fr: "https://fr.wikisource.org/wiki/Pens%C3%A9es_pour_moi-m%C3%AAme/Livre_II",
  },
  en: {
    title: "At Dawn",
    preview: "Begin the morning by saying to yourself: I shall meet with the busybody, the ungrateful, the arrogant, the deceitful, the envious, and the unsocial. Their conduct comes from ignorance of good and evil.",
    text: [
      "Begin the morning by saying to yourself: I shall meet with the busybody, the ungrateful, the arrogant, the deceitful, the envious, and the unsocial. All these things happen to them by reason of their ignorance of what is good and evil.",
      "But I, who have seen the nature of the good, that it is beautiful, and of the bad, that it is ugly, and the nature of the person who does wrong, that it is akin to me, can neither be injured by any of them nor be angry with my kinsman.",
      "We are made to work together, like feet, like hands, like eyelids, like the rows of the upper and lower teeth. To act against one another is contrary to nature; and it is acting against one another to be vexed and to turn away.",
    ],
    translationNote: "Public-domain translation by George Long, via Project Gutenberg.",
    essentialIdea: "Prepare for difficult people without surrendering your kinship with them. Their failures do not require your anger.",
    practice: "Before one difficult encounter, name the conduct you expect and the character you want to keep.",
    tension: "Forethought can steady us, but rehearsing other people’s faults can harden into contempt. Marcus pairs readiness with common humanity.",
    prompt: "Which encounter can you meet without giving away your character?",
    placeholder: "Dear Marcus,\n\nThis morning I notice…",
    notes: [
      {
        id: "common-kinship",
        phrase: "it is akin to me",
        label: "Common kinship",
        latin: "syngenēs",
        definition: "Related not only by blood, but through a shared capacity for reason and participation in human life.",
        context: "Marcus uses kinship to interrupt anger. Another person’s error remains wrong, yet it does not remove them from the human community.",
      },
    ],
  },
  fr: {
    title: "Au réveil",
    preview: "Le matin, dès qu’on s’éveille, il faut se prémunir pour la journée en se disant : je pourrai rencontrer aujourd’hui un fâcheux, un ingrat, un insolent, un fourbe, un envieux, un égoïste.",
    text: [
      "Le matin, dès qu’on s’éveille, il faut se prémunir pour la journée en se disant : je pourrai rencontrer aujourd’hui un fâcheux, un ingrat, un insolent, un fourbe, un envieux, un égoïste. Ils ont tous ces vices par suite de leur ignorance du bien et du mal.",
      "Mais moi, qui ai examiné la nature du bien, qui est d’être beau, et celle du mal, qui est d’être laid, je considère que l’homme vicieux a la même origine que moi. Je ne puis recevoir aucun tort de ces hommes, ni m’irriter contre un frère, ni m’éloigner de lui.",
      "Nous sommes nés pour l’action en commun, comme les pieds, les mains, les paupières, les rangées des dents d’en haut et d’en bas. Agir les uns contre les autres est donc contraire à la nature ; et c’est agir les uns contre les autres que de s’irriter et de se détourner.",
    ],
    translationNote: "Traduction du domaine public par Jules Barthélemy-Saint-Hilaire, via Wikisource.",
    essentialIdea: "Préparez-vous aux personnes difficiles sans renoncer à la parenté qui vous unit. Leurs fautes n’exigent pas votre colère.",
    practice: "Avant une rencontre difficile, nommez la conduite attendue et le caractère que vous voulez garder.",
    tension: "La prévoyance peut nous affermir, mais répéter les fautes d’autrui peut devenir du mépris. Marc Aurèle unit la préparation à l’humanité commune.",
    prompt: "Quelle rencontre pouvez-vous traverser sans abandonner votre caractère ?",
    placeholder: "Cher Marc Aurèle,\n\nCe matin, je remarque…",
    notes: [
      {
        id: "common-kinship",
        phrase: "la même origine que moi",
        label: "Parenté commune",
        latin: "syngenēs",
        definition: "Une parenté qui ne tient pas seulement au sang, mais à une raison partagée et à l’appartenance à la communauté humaine.",
        context: "Marc Aurèle emploie cette parenté pour interrompre la colère. L’erreur reste une erreur, mais elle n’exclut personne de la communauté humaine.",
      },
    ],
  },
};

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

export const readings = [...senecaReadings, marcusAtDawn, epictetusOnControl];

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
    works: 1,
  },
  {
    id: "epictetus",
    name: "Epictetus",
    reading: epictetusOnControl.number,
    works: 1,
  },
];

export const requestedVoices = [
  { id: "thoreau", name: "Henry David Thoreau", status: "edition-review" },
  { id: "meister-eckhart", name: "Meister Eckhart", status: "edition-review" },
  { id: "saint-augustine", name: "Saint Augustine", status: "edition-review" },
  { id: "emerson", name: "Ralph Waldo Emerson", status: "edition-review" },
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
