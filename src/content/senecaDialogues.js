import { publicSenecaDialogues } from "./publicSenecaDialogues.generated.js";

const guidance = {
  "shortness-life": {
    en: ["Time is not merely short; much of it is surrendered before it is lived.", "Protect one part of today from obligation, distraction, and display.", "Urgency can clarify a life, but it can also become another form of haste.", "Which part of your life do you keep postponing?"],
    fr: ["Le temps n’est pas seulement court ; une grande part en est cédée avant d’être vécue.", "Protégez une part de cette journée contre l’obligation, la distraction et le spectacle.", "L’urgence peut clarifier une vie, mais elle peut aussi devenir une autre forme de précipitation.", "Quelle part de votre vie remettez-vous toujours à plus tard ?"],
  },
  "peace-mind": {
    en: ["A steady mind needs purposeful activity, measured rest, and freedom from restless comparison.", "Remove one unnecessary demand and give the recovered attention to useful work.", "Withdrawal can restore proportion, but peace cannot depend on escaping every difficult circumstance.", "What keeps your mind moving after the need to move has passed?"],
    fr: ["Un esprit stable a besoin d’une activité choisie, d’un repos mesuré et d’une liberté devant la comparaison inquiète.", "Retirez une exigence inutile et rendez l’attention ainsi retrouvée à un travail utile.", "Le retrait peut rendre la mesure, mais la paix ne peut dépendre de la fuite devant toute difficulté.", "Qu’est-ce qui maintient votre esprit en mouvement quand le besoin d’agir a disparu ?"],
  },
  "happy-life": {
    en: ["Happiness rests on a mind aligned with reason, character, and reality rather than fortune.", "Choose one good action whose value does not depend on praise or success.", "Self-command can protect freedom, yet virtue becomes brittle when it ignores vulnerability and dependence.", "What good would remain worth doing if it brought no advantage?"],
    fr: ["Le bonheur repose sur un esprit accordé à la raison, au caractère et au réel plutôt qu’à la fortune.", "Choisissez un acte juste dont la valeur ne dépend ni de l’éloge ni du succès.", "La maîtrise de soi peut protéger la liberté, mais la vertu se dessèche si elle ignore la vulnérabilité et la dépendance.", "Quel bien resterait digne d’être accompli sans aucun avantage ?"],
  },
  providence: {
    en: ["Difficulty can test and disclose character, though suffering is never proof of moral worth.", "Meet one unavoidable difficulty with the next proportionate action.", "The language of providence can give adversity meaning, but it must not excuse preventable harm.", "What can this difficulty ask of you without being called good?"],
    fr: ["L’épreuve peut révéler et exercer le caractère, sans que la souffrance prouve jamais une valeur morale.", "Répondez à une difficulté inévitable par le prochain geste mesuré.", "La providence peut donner un sens à l’adversité, mais elle ne doit pas excuser un mal évitable.", "Que peut vous demander cette difficulté sans être pour autant appelée bonne ?"],
  },
  anger: {
    en: ["Anger promises correction while surrendering judgment to speed, injury, and the wish to punish.", "Delay one angry response until you can describe the harm without exaggeration.", "Refusing rage does not require indifference; injustice still calls for clear and forceful action.", "What response would serve justice after anger has spent its heat?"],
    fr: ["La colère promet de corriger tout en livrant le jugement à la vitesse, à la blessure et au désir de punir.", "Différez une réponse colérique jusqu’à pouvoir décrire le tort sans exagération.", "Refuser la rage n’impose pas l’indifférence ; l’injustice demande encore une action claire et ferme.", "Quelle réponse servirait la justice une fois la chaleur de la colère dissipée ?"],
  },
  benefits: {
    en: ["Giving and receiving form a moral relation when both are free from calculation, humiliation, and delay.", "Give one useful thing promptly and without managing the recipient’s gratitude.", "Generosity can bind people together, but a gift becomes control when it creates a hidden debt.", "What could you give without keeping an account?"],
    fr: ["Donner et recevoir forment une relation morale quand le calcul, l’humiliation et le retard en sont absents.", "Donnez promptement une chose utile sans diriger la gratitude de celui qui la reçoit.", "La générosité peut unir, mais le don devient contrôle lorsqu’il crée une dette cachée.", "Que pourriez-vous donner sans en tenir le compte ?"],
  },
};

function preview(text) {
  if (text.length <= 300) return text;
  const shortened = text.slice(0, 300);
  return `${shortened.slice(0, shortened.lastIndexOf(" "))}…`;
}

function guideFor(source) {
  if (source.slug.startsWith("anger-")) return guidance.anger;
  if (source.slug.startsWith("benefits-")) return guidance.benefits;
  return guidance[source.slug];
}

function localeContent(source, locale) {
  const [essentialIdea, practice, tension, prompt] = guideFor(source)[locale];
  const title = source.titles[locale];
  const isBenefits = source.slug.startsWith("benefits-");
  const isAnger = source.slug.startsWith("anger-");
  return {
    language: locale,
    title,
    preview: preview(source[locale].text[0]),
    text: source[locale].text,
    translationNote: locale === "en"
      ? `Complete public-domain translation by Aubrey Stewart (${isBenefits ? "1887" : "1889"}), via Project Gutenberg.`
      : isAnger
        ? "Traduction intégrale du domaine public par Joseph Baillard et Charles du Rozoir (1860), via Wikisource."
        : "Traduction intégrale du domaine public par Joseph Baillard (1914), via Wikisource.",
    essentialIdea,
    practice,
    tension,
    prompt,
    placeholder: locale === "en"
      ? `Dear Seneca,\n\nAfter “${title},” I notice…`
      : `Cher Sénèque,\n\nAprès « ${title} », je remarque…`,
    notes: [],
  };
}

export const senecaDialogues = publicSenecaDialogues.map((source) => ({
  number: source.number,
  author: "Seneca",
  authorId: "seneca",
  work: source.work,
  code: source.code,
  sources: source.sources,
  en: localeContent(source, "en"),
  fr: localeContent(source, "fr"),
}));
