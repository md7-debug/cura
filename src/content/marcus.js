import { publicMarcusBooks } from "./publicMarcusBooks.generated.js";

const readingNumbers = [203, 201, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213];

const guides = [
  {
    en: {
      title: "What I Received",
      essentialIdea: "Character is inherited through attention. Marcus begins by naming the qualities he saw in family, teachers, friends, and public servants.",
      practice: "Name one person who formed you and the exact quality you want to carry forward.",
      tension: "Gratitude can guide imitation without turning another person into a flawless model.",
      prompt: "What good in you began as someone else’s example?",
    },
    fr: {
      title: "Ce que j’ai reçu",
      essentialIdea: "Le caractère se transmet par l’attention. Marc Aurèle commence par nommer les qualités vues chez ses proches, ses maîtres, ses amis et les serviteurs de l’État.",
      practice: "Nommez une personne qui vous a formé et la qualité précise que vous voulez prolonger.",
      tension: "La gratitude peut guider l’imitation sans transformer l’autre en modèle sans défaut.",
      prompt: "Quel bien en vous a commencé par l’exemple d’un autre ?",
    },
  },
  {
    en: {
      title: "At Dawn",
      essentialIdea: "Prepare for difficult people without surrendering your kinship with them. Their failures do not require your anger.",
      practice: "Before one difficult encounter, name the conduct you expect and the character you want to keep.",
      tension: "Forethought can steady us, but rehearsing other people’s faults can harden into contempt. Marcus pairs readiness with common humanity.",
      prompt: "Which encounter can you meet without giving away your character?",
    },
    fr: {
      title: "Au réveil",
      essentialIdea: "Préparez-vous aux personnes difficiles sans renoncer à la parenté qui vous unit. Leurs fautes n’exigent pas votre colère.",
      practice: "Avant une rencontre difficile, nommez la conduite attendue et le caractère que vous voulez garder.",
      tension: "La prévoyance peut nous affermir, mais répéter les fautes d’autrui peut devenir du mépris. Marc Aurèle unit la préparation à l’humanité commune.",
      prompt: "Quelle rencontre pouvez-vous traverser sans abandonner votre caractère ?",
    },
  },
  {
    en: {
      title: "While Understanding Remains",
      essentialIdea: "Life shortens each day, and our capacity for clear judgment can fade before life ends. Practice cannot wait for a perfect season.",
      practice: "Give today’s clearest hour to the work that most needs your judgment.",
      tension: "Urgency can sharpen attention without making every moment anxious or rushed.",
      prompt: "What are you postponing as if your powers were guaranteed?",
    },
    fr: {
      title: "Tant que l’intelligence demeure",
      essentialIdea: "La vie diminue chaque jour, et notre faculté de juger clairement peut faiblir avant sa fin. La pratique ne peut attendre une saison parfaite.",
      practice: "Donnez l’heure la plus claire du jour au travail qui réclame le plus votre jugement.",
      tension: "L’urgence peut aiguiser l’attention sans rendre chaque instant anxieux ou précipité.",
      prompt: "Que remettez-vous comme si vos facultés étaient garanties ?",
    },
  },
  {
    en: {
      title: "The Mind’s Retreat",
      essentialIdea: "The mind can return to its own principles, meet obstacles as material, and recover proportion amid change.",
      practice: "When interrupted, ask what use your chosen principle can make of the obstacle.",
      tension: "An inward retreat restores judgment only when it returns us to action rather than hiding us from it.",
      prompt: "Where can you return within yourself without withdrawing from your duty?",
    },
    fr: {
      title: "La retraite intérieure",
      essentialIdea: "L’esprit peut revenir à ses principes, faire de l’obstacle une matière et retrouver la mesure au milieu du changement.",
      practice: "À la prochaine interruption, demandez quel usage votre principe choisi peut faire de l’obstacle.",
      tension: "La retraite intérieure restaure le jugement lorsqu’elle nous ramène à l’action au lieu de nous en cacher.",
      prompt: "Où pouvez-vous revenir en vous-même sans vous retirer de votre devoir ?",
    },
  },
  {
    en: {
      title: "Rise to Your Work",
      essentialIdea: "Human nature is active and social. Comfort has a place, but it cannot become the purpose of waking.",
      practice: "Begin one necessary task before asking whether you feel inclined to do it.",
      tension: "Discipline answers reluctance, while wise rest keeps discipline from becoming self-punishment.",
      prompt: "What work belongs to you today?",
    },
    fr: {
      title: "Lève-toi pour ton œuvre",
      essentialIdea: "La nature humaine est active et sociale. Le confort a sa place, mais il ne peut devenir le but du réveil.",
      practice: "Commencez une tâche nécessaire avant de demander si vous avez envie de la faire.",
      tension: "La discipline répond à la réticence, tandis qu’un repos juste l’empêche de devenir punition.",
      prompt: "Quelle œuvre vous appartient aujourd’hui ?",
    },
  },
  {
    en: {
      title: "In Accord with Nature",
      essentialIdea: "Change belongs to the order of the whole. The practical task is to act justly within what arrives.",
      practice: "Meet one unwanted change by naming the just action still available inside it.",
      tension: "Acceptance concerns reality as it is; it does not turn every human decision into something beyond criticism.",
      prompt: "What can you accept without surrendering your responsibility?",
    },
    fr: {
      title: "En accord avec la nature",
      essentialIdea: "Le changement appartient à l’ordre du tout. La tâche pratique consiste à agir avec justice dans ce qui arrive.",
      practice: "Face à un changement non voulu, nommez l’action juste qui reste disponible.",
      tension: "L’acceptation concerne le réel tel qu’il est ; elle ne place pas toute décision humaine au-delà de la critique.",
      prompt: "Que pouvez-vous accepter sans abandonner votre responsabilité ?",
    },
  },
  {
    en: {
      title: "Return to the Present",
      essentialIdea: "Events repeat, impressions pass, and the present remains the only place where judgment and action occur.",
      practice: "Reduce one recurring worry to the next concrete act it asks of you now.",
      tension: "Seeing familiar patterns gives perspective, but it must not flatten each person’s particular suffering.",
      prompt: "What changes when you return this concern to the present?",
    },
    fr: {
      title: "Reviens au présent",
      essentialIdea: "Les événements se répètent, les impressions passent, et le présent reste le seul lieu du jugement et de l’action.",
      practice: "Ramenez une inquiétude récurrente au prochain acte concret qu’elle vous demande maintenant.",
      tension: "Reconnaître les mêmes formes donne de la perspective sans effacer la souffrance particulière de chacun.",
      prompt: "Que devient cette inquiétude lorsque vous la ramenez au présent ?",
    },
  },
  {
    en: {
      title: "Govern the Ruling Mind",
      essentialIdea: "Reputation cannot repair a life. Progress begins by governing present judgments rather than managing an image of wisdom.",
      practice: "Make one choice for its justice alone and leave its appearance unmanaged.",
      tension: "Self-scrutiny serves change until it turns into shame that prevents the next right act.",
      prompt: "What would you do if you stopped trying to look improved?",
    },
    fr: {
      title: "Gouverner le principe directeur",
      essentialIdea: "La réputation ne répare pas une vie. Le progrès commence en gouvernant les jugements présents plutôt qu’une image de sagesse.",
      practice: "Faites un choix pour sa seule justice et laissez son apparence sans contrôle.",
      tension: "L’examen de soi sert le changement jusqu’au moment où la honte empêche l’acte juste suivant.",
      prompt: "Que feriez-vous si vous cessiez de chercher à paraître meilleur ?",
    },
  },
  {
    en: {
      title: "Made for One Another",
      essentialIdea: "Injustice, falsehood, and contempt break faith with our social nature. Human beings exist to help, not injure, one another.",
      practice: "Repair one small breach of trust through a truthful and useful act.",
      tension: "Common humanity grounds justice without asking us to excuse harmful conduct.",
      prompt: "Where does your conduct need to return to the common good?",
    },
    fr: {
      title: "Faits les uns pour les autres",
      essentialIdea: "L’injustice, le mensonge et le mépris rompent avec notre nature sociale. Les humains existent pour s’aider, non pour se nuire.",
      practice: "Réparez une petite rupture de confiance par un acte vrai et utile.",
      tension: "L’humanité commune fonde la justice sans nous demander d’excuser les conduites nuisibles.",
      prompt: "Où votre conduite doit-elle revenir au bien commun ?",
    },
  },
  {
    en: {
      title: "Become Good Now",
      essentialIdea: "The soul does not need another place or another life before it can become simple, just, and content with the present task.",
      practice: "Remove one condition you have placed before doing the right thing.",
      tension: "Contentment with the present supports action; it does not forbid changing conditions that are unjust.",
      prompt: "What condition are you waiting for before you begin to live well?",
    },
    fr: {
      title: "Deviens bon maintenant",
      essentialIdea: "L’âme n’a besoin ni d’un autre lieu ni d’une autre vie pour devenir simple, juste et satisfaite de la tâche présente.",
      practice: "Retirez une condition que vous avez placée avant l’action juste.",
      tension: "Le contentement dans le présent soutient l’action ; il n’interdit pas de changer des conditions injustes.",
      prompt: "Quelle condition attendez-vous avant de commencer à bien vivre ?",
    },
  },
  {
    en: {
      title: "The Rational Soul",
      essentialIdea: "The rational soul can examine itself, choose its form, love its neighbour, and complete a good act even when life is interrupted.",
      practice: "Complete one act fully instead of measuring the day by how many acts it contains.",
      tension: "Inner freedom is real, yet it develops through repeated practice and life with other people.",
      prompt: "What single act would make this hour complete?",
    },
    fr: {
      title: "L’âme raisonnable",
      essentialIdea: "L’âme raisonnable peut s’examiner, choisir sa forme, aimer son prochain et achever un acte bon même si la vie s’interrompt.",
      practice: "Achevez un acte pleinement au lieu de mesurer la journée au nombre de ses actes.",
      tension: "La liberté intérieure est réelle, mais elle se développe par la pratique répétée et la vie avec les autres.",
      prompt: "Quel acte unique rendrait cette heure complète ?",
    },
  },
  {
    en: {
      title: "The Present Is Enough",
      essentialIdea: "Set aside the past, entrust the future, and govern the present through justice and truth. A complete life is composed in the act at hand.",
      practice: "Close one unfinished mental loop by choosing its truthful present action or releasing it.",
      tension: "Attention to the present frees us from fantasy without erasing memory, planning, or care for consequences.",
      prompt: "What becomes sufficient when you stop adding the past and future to it?",
    },
    fr: {
      title: "Le présent suffit",
      essentialIdea: "Mettez le passé de côté, confiez l’avenir et gouvernez le présent par la justice et la vérité. Une vie complète se compose dans l’acte en cours.",
      practice: "Fermez une préoccupation inachevée en choisissant son action vraie dans le présent, ou en la relâchant.",
      tension: "L’attention au présent libère de la fiction sans effacer la mémoire, la prévision ni le soin des conséquences.",
      prompt: "Qu’est-ce qui devient suffisant lorsque vous cessez d’y ajouter le passé et l’avenir ?",
    },
  },
];

function preview(text) {
  const limit = 300;
  if (text.length <= limit) return text;
  const shortened = text.slice(0, limit);
  return `${shortened.slice(0, shortened.lastIndexOf(" "))}…`;
}

function notesForBook(book) {
  if (book !== 2) return { en: [], fr: [] };
  return {
    en: [
      {
        id: "common-kinship",
        phrase: "it is akin to me",
        label: "Common kinship",
        latin: "syngenēs",
        definition: "Related through a shared capacity for reason and participation in human life.",
        context: "Marcus uses kinship to interrupt anger. Error remains wrong, but does not remove a person from the human community.",
      },
    ],
    fr: [
      {
        id: "common-kinship",
        phrase: "être de ma famille",
        label: "Parenté commune",
        latin: "syngenēs",
        definition: "Une parenté fondée sur la raison partagée et l’appartenance à la communauté humaine.",
        context: "Marc Aurèle emploie cette parenté pour interrompre la colère. L’erreur reste une erreur, sans exclure personne de la communauté humaine.",
      },
    ],
  };
}

export const marcusReadings = publicMarcusBooks.map((sourceBook, index) => {
  const guide = guides[index];
  const notes = notesForBook(sourceBook.book);
  return {
    number: readingNumbers[index],
    author: "Marcus Aurelius",
    authorId: "marcus-aurelius",
    work: {
      en: `Meditations · Book ${sourceBook.roman}`,
      fr: `Pensées pour moi-même · Livre ${sourceBook.roman}`,
    },
    code: {
      en: `BOOK ${sourceBook.roman}`,
      fr: `LIVRE ${sourceBook.roman}`,
    },
    sources: sourceBook.sources,
    en: {
      ...guide.en,
      preview: preview(sourceBook.en.text[0]),
      text: sourceBook.en.text,
      translationNote: "Complete public-domain translation by George Long, via Wikisource.",
      placeholder: `Dear Marcus,\n\nAfter Book ${sourceBook.roman}, I notice…`,
      notes: notes.en,
    },
    fr: {
      ...guide.fr,
      preview: preview(sourceBook.fr.text[0]),
      text: sourceBook.fr.text,
      translationNote: "Traduction intégrale du domaine public par Jules Barthélemy-Saint-Hilaire, via Wikisource.",
      placeholder: `Cher Marc Aurèle,\n\nAprès le Livre ${sourceBook.roman}, je remarque…`,
      notes: notes.fr,
    },
  };
});

export const marcusAtDawn = marcusReadings[1];
