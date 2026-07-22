import { letter32 } from "./letter32.js";
import { publicLetters } from "./publicLetters.generated.js";

const guides = {
  1: {
    en: {
      essentialIdea: "Time is the one possession that cannot be restored. Care begins by noticing where each day goes.",
      practice: "Name one hour you will protect today and give it a single purpose.",
      tension: "Seneca asks for urgency without panic: value the day because life is passing, then use it calmly.",
      prompt: "Where does your time leave without your consent?",
    },
    fr: {
      essentialIdea: "Le temps est le seul bien qui ne se restitue pas. Le soin commence quand on voit où passe chaque journée.",
      practice: "Nommez une heure à protéger aujourd’hui et donnez-lui une seule intention.",
      tension: "Sénèque demande de l’urgence sans panique : reconnaître que la vie passe, puis employer le jour avec calme.",
      prompt: "Où votre temps s’en va-t-il sans votre consentement ?",
    },
  },
  2: {
    en: {
      essentialIdea: "Reading forms the mind through depth, not accumulation. A few trusted works can become inner companions.",
      practice: "Return to one passage instead of opening another book.",
      tension: "Variety can refresh attention, yet constant movement keeps every idea at the surface.",
      prompt: "What deserves to be read again rather than replaced?",
    },
    fr: {
      essentialIdea: "La lecture forme l’esprit par la profondeur, non par l’accumulation. Quelques œuvres fidèles deviennent des compagnons intérieurs.",
      practice: "Revenez à un passage au lieu d’ouvrir un nouveau livre.",
      tension: "La variété peut réveiller l’attention, mais le mouvement constant laisse chaque idée à la surface.",
      prompt: "Qu’est-ce qui mérite d’être relu plutôt que remplacé ?",
    },
  },
  3: {
    en: {
      essentialIdea: "Friendship needs judgment before trust and wholehearted trust once the judgment is made.",
      practice: "Notice whether you speak to a friend with the same honesty you use alone.",
      tension: "Caution protects intimacy at first, but permanent suspicion makes intimacy impossible.",
      prompt: "Whom do you trust, and what has earned that trust?",
    },
    fr: {
      essentialIdea: "L’amitié demande du discernement avant la confiance, puis une confiance entière une fois le choix fait.",
      practice: "Voyez si vous parlez à un ami avec la même sincérité que dans la solitude.",
      tension: "La prudence protège d’abord l’intimité, mais le soupçon permanent la rend impossible.",
      prompt: "À qui faites-vous confiance, et qu’est-ce qui a fondé cette confiance ?",
    },
  },
  4: {
    en: {
      essentialIdea: "Fear loses authority when we examine death and poverty instead of keeping them unnamed.",
      practice: "Describe the feared outcome plainly, then separate pain from imagination.",
      tension: "Preparing for hardship can free the mind, but rehearsing it without measure can become another fear.",
      prompt: "Which fear becomes smaller when you give it a precise name?",
    },
    fr: {
      essentialIdea: "La peur perd son pouvoir lorsque nous examinons la mort et la pauvreté au lieu de les laisser sans nom.",
      practice: "Décrivez clairement l’issue redoutée, puis séparez la douleur de l’imagination.",
      tension: "Se préparer à l’épreuve peut libérer l’esprit, mais la répéter sans mesure peut devenir une autre peur.",
      prompt: "Quelle peur diminue lorsque vous la nommez avec précision ?",
    },
  },
  5: {
    en: {
      essentialIdea: "Philosophy changes conduct without turning simplicity into costume or virtue into display.",
      practice: "Make one quiet choice that needs no witness.",
      tension: "A different life may become visible, yet the wish to look different can corrupt the change.",
      prompt: "Where has self-improvement become performance?",
    },
    fr: {
      essentialIdea: "La philosophie transforme la conduite sans faire de la simplicité un costume ni de la vertu un spectacle.",
      practice: "Faites un choix discret qui n’a besoin d’aucun témoin.",
      tension: "Une vie différente finit par se voir, mais le désir de paraître différent peut corrompre le changement.",
      prompt: "Où l’amélioration de soi est-elle devenue une mise en scène ?",
    },
  },
  6: {
    en: {
      essentialIdea: "Knowledge becomes fully ours when it can be shared clearly and used in friendship.",
      practice: "Explain one useful idea to someone without trying to impress them.",
      tension: "Study is inward work, yet keeping every insight private can make it sterile.",
      prompt: "Who could learn beside you, and what would you share?",
    },
    fr: {
      essentialIdea: "Le savoir devient vraiment nôtre lorsqu’il peut être partagé clairement et servir l’amitié.",
      practice: "Expliquez une idée utile à quelqu’un sans chercher à l’impressionner.",
      tension: "L’étude est un travail intérieur, mais garder chaque découverte pour soi peut la rendre stérile.",
      prompt: "Qui pourrait apprendre à vos côtés, et que partageriez-vous ?",
    },
  },
  7: {
    en: {
      essentialIdea: "Attention takes the shape of its company. Crowds can normalize cruelty before we notice the change.",
      practice: "After a gathering or a feed, name what entered your mind with it.",
      tension: "We need other people, but not every collective mood deserves admission.",
      prompt: "Which crowd leaves you less yourself?",
    },
    fr: {
      essentialIdea: "L’attention prend la forme de ses fréquentations. La foule peut rendre la cruauté normale avant que nous le remarquions.",
      practice: "Après une réunion ou un fil d’actualité, nommez ce qui est entré dans votre esprit.",
      tension: "Nous avons besoin des autres, mais toutes les humeurs collectives ne méritent pas d’entrer en nous.",
      prompt: "Quelle foule vous laisse moins vous-même ?",
    },
  },
  8: {
    en: {
      essentialIdea: "Retreat is not idleness when quiet work prepares something useful for other people.",
      practice: "Give an undisturbed interval to work whose value will outlast the hour.",
      tension: "Withdrawal can protect attention, yet it must not become an excuse to abandon responsibility.",
      prompt: "What quiet work could still serve someone beyond you?",
    },
    fr: {
      essentialIdea: "La retraite n’est pas oisive lorsque le travail silencieux prépare quelque chose d’utile aux autres.",
      practice: "Donnez un temps sans interruption à un travail dont la valeur dépassera cette heure.",
      tension: "Le retrait peut protéger l’attention, mais il ne doit pas devenir un prétexte pour fuir la responsabilité.",
      prompt: "Quel travail silencieux pourrait encore servir au-delà de vous ?",
    },
  },
  9: {
    en: {
      essentialIdea: "The wise person can stand alone and still choose friendship for its own sake.",
      practice: "Offer companionship without turning the other person into a remedy for loneliness.",
      tension: "Self-sufficiency protects love from need, but complete detachment would empty friendship of care.",
      prompt: "Where do you seek connection from choice rather than need?",
    },
    fr: {
      essentialIdea: "Le sage peut se tenir seul et choisir pourtant l’amitié pour elle-même.",
      practice: "Offrez votre présence sans faire de l’autre un remède à la solitude.",
      tension: "L’autonomie libère l’amour du besoin, mais un détachement total viderait l’amitié de son soin.",
      prompt: "Où cherchez-vous le lien par choix plutôt que par besoin ?",
    },
  },
  10: {
    en: {
      essentialIdea: "Changing place is not enough. A restless mind carries its noise into every retreat.",
      practice: "Sit without adding input and observe what still demands an audience.",
      tension: "Solitude removes external distraction, then reveals the internal distraction that remains.",
      prompt: "What follows you into solitude?",
    },
    fr: {
      essentialIdea: "Changer de lieu ne suffit pas. Un esprit agité transporte son bruit dans chaque retraite.",
      practice: "Restez sans ajouter de stimulation et observez ce qui réclame encore un public.",
      tension: "La solitude retire la distraction extérieure, puis révèle celle qui demeure à l’intérieur.",
      prompt: "Qu’est-ce qui vous suit jusque dans la solitude ?",
    },
  },
  11: {
    en: {
      essentialIdea: "Practice can shape character without erasing every natural response. A chosen model helps conduct become steadier.",
      practice: "Before one decision, imagine a person whose presence calls you to honesty.",
      tension: "We can train ourselves deeply, yet wisdom does not require the disappearance of every blush or tremor.",
      prompt: "Whose imagined presence steadies your conduct?",
    },
    fr: {
      essentialIdea: "La pratique forme le caractère sans effacer chaque réaction naturelle. Un modèle choisi rend la conduite plus stable.",
      practice: "Avant une décision, imaginez une personne dont la présence vous appelle à la sincérité.",
      tension: "Nous pouvons nous former en profondeur, mais la sagesse n’exige pas la disparition de chaque rougeur ou tremblement.",
      prompt: "Quelle présence imaginée affermit votre conduite ?",
    },
  },
  12: {
    en: {
      essentialIdea: "Old age can reveal the value of a complete day when it is met as a season, not an insult.",
      practice: "Close the day by asking whether it was whole, not whether it was impressive.",
      tension: "Life should not be abandoned from weariness, yet its length alone cannot make it good.",
      prompt: "What has age, change, or limitation taught you to value?",
    },
    fr: {
      essentialIdea: "La vieillesse révèle la valeur d’une journée complète lorsqu’on l’accueille comme une saison, non comme une offense.",
      practice: "Terminez le jour en demandant s’il fut entier, non s’il fut impressionnant.",
      tension: "La vie ne doit pas être quittée par lassitude, mais sa seule longueur ne peut la rendre bonne.",
      prompt: "Qu’est-ce que l’âge, le changement ou la limite vous a appris à estimer ?",
    },
  },
  13: {
    en: {
      essentialIdea: "We often suffer a forecast before reality has asked anything of us.",
      practice: "Write the evidence for one fear beside the story imagination has added.",
      tension: "Prudence looks ahead, but anxiety treats every possibility as a present fact.",
      prompt: "Which part of a current fear is fact, and which part is rehearsal?",
    },
    fr: {
      essentialIdea: "Nous souffrons souvent d’une prévision avant que la réalité ne nous demande quoi que ce soit.",
      practice: "Écrivez les preuves d’une peur à côté du récit ajouté par l’imagination.",
      tension: "La prudence regarde devant elle, mais l’anxiété traite chaque possibilité comme un fait présent.",
      prompt: "Dans une peur actuelle, qu’est-ce qui relève du fait et qu’est-ce qui relève de la répétition ?",
    },
  },
  14: {
    en: {
      essentialIdea: "Care for the body supports life; servitude to the body narrows life around comfort and fear.",
      practice: "Choose one act of care that strengthens capacity instead of feeding preoccupation.",
      tension: "The body deserves attention, but treating survival as the highest good makes every threat a master.",
      prompt: "Where has care for yourself become captivity to comfort?",
    },
    fr: {
      essentialIdea: "Le soin du corps soutient la vie ; la servitude envers le corps enferme la vie dans le confort et la peur.",
      practice: "Choisissez un soin qui renforce votre capacité au lieu de nourrir la préoccupation.",
      tension: "Le corps mérite de l’attention, mais faire de la survie le bien suprême donne un maître à chaque menace.",
      prompt: "Où le soin de vous-même est-il devenu une captivité du confort ?",
    },
  },
  15: {
    en: {
      essentialIdea: "Simple physical practice should serve the mind, not consume the time needed to form it.",
      practice: "Choose the smallest bodily routine that leaves you more awake for thought.",
      tension: "Strength supports steadiness, but devotion to training can become another distraction from character.",
      prompt: "Which routine truly supports your mind?",
    },
    fr: {
      essentialIdea: "Un exercice physique simple doit servir l’esprit, non absorber le temps nécessaire à sa formation.",
      practice: "Choisissez la plus petite pratique corporelle qui vous laisse plus éveillé pour penser.",
      tension: "La force soutient la stabilité, mais le culte de l’entraînement peut devenir une autre distraction du caractère.",
      prompt: "Quelle habitude soutient réellement votre esprit ?",
    },
  },
  16: {
    en: {
      essentialIdea: "Philosophy is a guide for conduct. Agreement in words matters only when the day begins to take its shape.",
      practice: "Choose one belief and give it a visible place in today’s schedule.",
      tension: "Principles orient action, but admiration for principles can imitate progress without changing anything.",
      prompt: "Which belief has not yet entered your calendar?",
    },
    fr: {
      essentialIdea: "La philosophie guide la conduite. L’accord des mots ne compte que lorsque la journée commence à en prendre la forme.",
      practice: "Choisissez une conviction et donnez-lui une place visible dans l’emploi du jour.",
      tension: "Les principes orientent l’action, mais les admirer peut imiter le progrès sans rien changer.",
      prompt: "Quelle conviction n’est pas encore entrée dans votre agenda ?",
    },
  },
  17: {
    en: {
      essentialIdea: "Philosophy asks for commitment before ideal conditions arrive. Fewer wants can make that commitment possible.",
      practice: "Remove one expense, possession, or expectation that delays the work you value.",
      tension: "Material security can protect study, yet waiting for perfect security may postpone it forever.",
      prompt: "What are you willing to need less so that you can begin?",
    },
    fr: {
      essentialIdea: "La philosophie demande un engagement avant l’arrivée des conditions idéales. Désirer moins peut rendre cet engagement possible.",
      practice: "Retirez une dépense, un objet ou une attente qui retarde le travail auquel vous tenez.",
      tension: "La sécurité matérielle peut protéger l’étude, mais attendre une sécurité parfaite peut la reporter toujours.",
      prompt: "De quoi accepteriez-vous d’avoir moins besoin pour commencer ?",
    },
  },
  18: {
    en: {
      essentialIdea: "Brief voluntary discomfort tests whether comfort is a tool or a hidden requirement.",
      practice: "Choose a modest, safe simplicity for one meal or one evening and observe the mind’s protest.",
      tension: "Practice can loosen fear of deprivation, but hardship performed for pride misses its purpose.",
      prompt: "Which comfort has quietly become a condition for peace?",
    },
    fr: {
      essentialIdea: "Une gêne volontaire et brève révèle si le confort est un outil ou une exigence cachée.",
      practice: "Choisissez une simplicité modeste et sûre pour un repas ou une soirée, puis observez la protestation de l’esprit.",
      tension: "L’exercice peut défaire la peur du manque, mais l’épreuve accomplie par orgueil manque son but.",
      prompt: "Quel confort est devenu en silence une condition de votre paix ?",
    },
  },
  19: {
    en: {
      essentialIdea: "A role can continue to possess us after it has ceased to serve us. Retirement begins by withdrawing consent.",
      practice: "Name one obligation kept for status rather than use and reduce its claim.",
      tension: "Leaving ambition restores time, but public ties and old habits do not release us at once.",
      prompt: "Which role keeps living after its purpose has ended?",
    },
    fr: {
      essentialIdea: "Un rôle peut continuer à nous posséder après avoir cessé de nous servir. Le retrait commence quand nous retirons notre consentement.",
      practice: "Nommez une obligation gardée pour le statut plutôt que pour son utilité, puis réduisez son emprise.",
      tension: "Quitter l’ambition rend du temps, mais les liens publics et les anciennes habitudes ne nous libèrent pas d’un coup.",
      prompt: "Quel rôle continue de vivre après la fin de son utilité ?",
    },
  },
  20: {
    en: {
      essentialIdea: "A teaching becomes credible when repeated choices begin to agree with it.",
      practice: "Review one claim you make about your values and compare it with yesterday’s actions.",
      tension: "No life is perfectly consistent, but using imperfection as permission prevents any correction.",
      prompt: "Where do your words and your repeated actions part company?",
    },
    fr: {
      essentialIdea: "Un enseignement devient crédible lorsque les choix répétés commencent à lui correspondre.",
      practice: "Prenez une affirmation sur vos valeurs et comparez-la aux actes d’hier.",
      tension: "Aucune vie n’est parfaitement cohérente, mais faire de l’imperfection une permission empêche toute correction.",
      prompt: "Où vos paroles et vos actes répétés se séparent-ils ?",
    },
  },
};

const sourceNotes = {
  en: "Public-domain translation by Richard M. Gummere, via Wikisource.",
  fr: "Traduction du domaine public par Joseph Baillard, via Wikisource.",
};

const placeholders = {
  en: "Dear Seneca,\n\nToday I notice…",
  fr: "Cher Sénèque,\n\nAujourd’hui, je remarque…",
};

function previewFrom(text) {
  const paragraph = text[0] ?? "";
  if (paragraph.length <= 520) return paragraph;
  const boundary = paragraph.lastIndexOf(" ", 520);
  return `${paragraph.slice(0, boundary > 360 ? boundary : 520)}…`;
}

function fallbackGuide(letter, locale) {
  if (locale === "fr") {
    return {
      essentialIdea: `Sénèque fait de « ${letter.title} » une question de conduite : que change cette idée lorsqu’elle est pratiquée plutôt qu’admirée ?`,
      practice: "Marquez la phrase qui résiste à un accord facile, puis reformulez-la avec vos propres mots.",
      tension: "Lisez en observant la distance entre l’exigence de Sénèque et les conditions d’une vie ordinaire.",
      prompt: "Quelle phrase vous demande le plus, et pourquoi ?",
    };
  }
  return {
    essentialIdea: `Seneca turns “${letter.title}” into a question of conduct: what changes when the idea is practiced rather than admired?`,
    practice: "Mark the sentence that resists easy agreement, then restate it in your own words.",
    tension: "Read for the distance between Seneca’s standard and the conditions of an ordinary life.",
    prompt: "Which sentence asks the most of you, and why?",
  };
}

const openingLetters = publicLetters.map((letter) => ({
  ...letter,
  en: {
    ...letter.en,
    ...(guides[letter.number]?.en ?? fallbackGuide(letter.en, "en")),
    preview: previewFrom(letter.en.text),
    placeholder: placeholders.en,
    notes: [],
    translationNote: sourceNotes.en,
  },
  fr: {
    ...letter.fr,
    ...(guides[letter.number]?.fr ?? fallbackGuide(letter.fr, "fr")),
    preview: previewFrom(letter.fr.text),
    placeholder: placeholders.fr,
    notes: [],
    translationNote: sourceNotes.fr,
  },
}));

const progressLetter = {
  ...letter32,
  sources: { en: letter32.sources.latin, fr: letter32.sources.latin },
  en: { ...letter32.en, practice: letter32.en.phraseMeaning },
  fr: { ...letter32.fr, practice: letter32.fr.phraseMeaning },
};

export const letters = [
  ...openingLetters.filter((letter) => letter.number !== progressLetter.number),
  progressLetter,
].sort((a, b) => a.number - b.number);

export function getLetter(number) {
  return letters.find((letter) => letter.number === Number(number)) ?? letters[0];
}
