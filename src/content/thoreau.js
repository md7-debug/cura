import { publicWalden } from "./publicWalden.generated.js";

const guidance = [
  ["Examine what life costs before mistaking convention for necessity.", "List one expense of money, time, or attention that does not serve your life.", "Simplicity can free attention, but poverty is not a costume and deprivation is not a moral achievement.", "What have you accepted as necessary without examining its cost?"],
  ["Choosing where and why to live turns a place into a deliberate practice.", "State the purpose of one part of your day before you enter it.", "Deliberate living needs openness; a plan that cannot meet reality becomes another enclosure.", "What would it mean to live this day on purpose?"],
  ["Reading can be an exacting encounter with minds whose words outlast their moment.", "Read one paragraph slowly enough to hear its structure and answer it in your own words.", "Reverence for books can deepen attention, but it should not turn inherited canons into unquestioned authority.", "Which book asks more of you than information?"],
  ["A place becomes legible when we listen beyond the demands of human speech.", "Keep ten minutes without added sound and name what the place is already saying.", "Attention to sound can restore presence, though retreat never makes the surrounding world disappear.", "What do you hear when you stop arranging the soundscape?"],
  ["Solitude can make the self and the living world feel less separate.", "Spend one interval alone without converting it into productivity or consumption.", "Solitude can clarify relation, but it can also conceal the support that makes withdrawal possible.", "When does being alone become companionship?"],
  ["Hospitality tests whether simplicity has room for another person.", "Make one conversation spacious enough that neither person has to perform.", "Welcome needs generosity, yet intimacy also needs limits and consent.", "What kind of room do you make for another mind?"],
  ["Patient work joins the body, a season, and a piece of ground.", "Give one repetitive task complete attention instead of rushing toward its result.", "Work close to the land can teach limits without romanticizing labor or ownership.", "What has patient work taught you that thought alone could not?"],
  ["The village carries news, trade, curiosity, and the pressure to return to common measures.", "Notice which public message deserves an answer and which merely recruits attention.", "Community can correct solitude, while gossip and spectacle can dissolve judgment.", "How do you enter public life without giving it your whole mind?"],
  ["Close observation turns familiar water into depth, season, memory, and relation.", "Return to one familiar place and record three details you have not named before.", "Knowledge can strengthen care, but measurement never exhausts the meaning of a place.", "What familiar place becomes strange when you attend to it?"],
  ["An abandoned shelter reveals how little separates comfort, hardship, and exposure.", "Repair one practical condition before narrating what it means.", "Austere experience can sharpen perception, but chosen hardship differs from hardship imposed on others.", "Which comfort protects life, and which one only protects habit?"],
  ["Appetite belongs to life, yet conscience asks how desire becomes action.", "Pause before one appetite and choose its proportion instead of obeying its speed.", "Self-restraint can widen freedom, but purity can become contempt for the body and other people.", "Which desire needs understanding rather than either indulgence or shame?"],
  ["Other creatures are neighbors with lives that exceed the stories we assign them.", "Observe one animal without turning its behavior immediately into a lesson about yourself.", "Analogy can awaken kinship, but it can also erase the creature’s difference.", "What changes when you meet another creature as a neighbor?"],
  ["Preparing for winter makes dwelling a practical relation among shelter, fuel, and season.", "Complete one act of maintenance before it becomes urgent.", "Readiness supports freedom, though stockpiling can turn prudence into fear.", "What quiet preparation would make the coming season more habitable?"],
  ["Memory keeps former inhabitants present in a landscape that appears empty.", "Learn one name or history attached to the ground you cross every day.", "Recovering overlooked lives can correct the record, but imagination must not replace evidence.", "Whose life has disappeared from the story of this place?"],
  ["Winter reveals forms of movement and survival that summer conceals.", "Look for one sign of active life in a place you had judged dormant.", "Observation can deepen respect without pretending that nature offers a simple moral code.", "What life continues outside your field of attention?"],
  ["The frozen pond joins hidden depth, stored water, labor, and distant exchange.", "Trace one ordinary resource back through the people and place that provide it.", "Seeing systems enlarges responsibility, though wonder should not hide exploitation within them.", "What hidden network supports an ordinary part of your day?"],
  ["Thawing ice makes renewal visible as a physical process rather than an abstract promise.", "Notice one small change that shows a season or habit beginning to turn.", "Renewal is real, but it does not erase loss or guarantee moral progress.", "What is changing before you are ready to name it?"],
  ["A life can remain unfinished and still turn toward wakefulness, experiment, and a wider horizon.", "Choose one next step that keeps inquiry alive instead of closing it with certainty.", "Self-renewal needs courage, but endless departure can avoid commitments that deserve endurance.", "Where is a more awake life asking you to begin?"],
];

const guidanceFr = [
  ["Examinez ce que coûte la vie avant de prendre la convention pour une nécessité.", "Nommez une dépense d’argent, de temps ou d’attention qui ne sert pas votre vie.", "La simplicité peut libérer l’attention, mais la pauvreté n’est pas un costume et le manque n’est pas un mérite.", "Qu’avez-vous accepté comme nécessaire sans en examiner le coût ?"],
  ["Choisir où et pourquoi vivre fait d’un lieu une pratique délibérée.", "Énoncez l’intention d’une part de votre journée avant d’y entrer.", "Une vie délibérée reste ouverte ; un plan incapable de rencontrer le réel devient une autre clôture.", "Que signifierait vivre cette journée à dessein ?"],
  ["Lire peut devenir une rencontre exigeante avec des esprits dont les mots dépassent leur époque.", "Lisez un paragraphe assez lentement pour en entendre la forme, puis répondez avec vos mots.", "Le respect des livres approfondit l’attention, mais ne doit pas transformer le canon en autorité incontestable.", "Quel livre vous demande davantage que de l’information ?"],
  ["Un lieu devient lisible quand nous écoutons au-delà des exigences de la parole humaine.", "Gardez dix minutes sans ajouter de son et nommez ce que le lieu dit déjà.", "L’écoute peut rendre la présence, sans faire disparaître le monde qui nous entoure.", "Qu’entendez-vous lorsque vous cessez d’organiser le paysage sonore ?"],
  ["La solitude peut rendre le moi et le monde vivant moins séparés.", "Passez un moment seul sans le convertir en production ni en consommation.", "La solitude clarifie parfois la relation, mais elle peut cacher les soutiens qui rendent le retrait possible.", "Quand le fait d’être seul devient-il une compagnie ?"],
  ["L’hospitalité éprouve si la simplicité sait faire place à autrui.", "Donnez à une conversation assez d’espace pour que personne n’ait à jouer un rôle.", "L’accueil demande de la générosité, tandis que l’intimité exige aussi des limites et le consentement.", "Quelle place faites-vous à un autre esprit ?"],
  ["Le travail patient relie le corps, la saison et une parcelle de terre.", "Accordez toute votre attention à une tâche répétitive au lieu d’en hâter le résultat.", "Le travail de la terre enseigne des limites sans qu’il faille idéaliser le labeur ou la propriété.", "Que vous a appris le travail patient que la pensée seule ne pouvait enseigner ?"],
  ["Le village rassemble nouvelles, échanges, curiosité et pression des mesures communes.", "Distinguez le message public qui mérite une réponse de celui qui recrute seulement votre attention.", "La communauté peut corriger la solitude, tandis que le spectacle et la rumeur dissolvent le jugement.", "Comment entrer dans la vie publique sans lui céder tout votre esprit ?"],
  ["L’observation précise transforme une eau familière en profondeur, saison, mémoire et relation.", "Revenez dans un lieu connu et notez trois détails encore jamais nommés.", "La connaissance peut soutenir le soin, mais la mesure n’épuise jamais le sens d’un lieu.", "Quel lieu familier devient étrange lorsque vous y prêtez attention ?"],
  ["Un abri délaissé révèle la faible distance entre confort, épreuve et exposition.", "Réparez une condition concrète avant d’en raconter la signification.", "L’austérité choisie peut aiguiser la perception, mais elle diffère de l’épreuve imposée.", "Quel confort protège la vie, et lequel protège seulement l’habitude ?"],
  ["L’appétit appartient à la vie, mais la conscience demande comment le désir devient acte.", "Faites une pause devant un appétit et choisissez sa mesure au lieu d’obéir à sa vitesse.", "La retenue peut élargir la liberté, mais la pureté peut devenir mépris du corps et d’autrui.", "Quel désir demande à être compris plutôt qu’assouvi ou couvert de honte ?"],
  ["Les autres créatures sont des voisines dont la vie dépasse les histoires que nous leur prêtons.", "Observez un animal sans transformer aussitôt son comportement en leçon sur vous-même.", "L’analogie peut éveiller la parenté, mais elle peut aussi effacer la différence de l’animal.", "Qu’est-ce qui change quand vous rencontrez une autre créature comme voisine ?"],
  ["Préparer l’hiver fait de l’habitation une relation concrète entre abri, combustible et saison.", "Accomplissez un geste d’entretien avant qu’il ne devienne urgent.", "La prévoyance soutient la liberté, mais l’accumulation peut changer la prudence en peur.", "Quelle préparation discrète rendrait la saison prochaine plus habitable ?"],
  ["La mémoire maintient les anciens habitants dans un paysage qui paraît vide.", "Apprenez un nom ou une histoire attachée au sol que vous traversez chaque jour.", "Retrouver des vies oubliées corrige le récit, mais l’imagination ne doit pas remplacer les preuves.", "Quelle vie a disparu de l’histoire de ce lieu ?"],
  ["L’hiver révèle des formes de mouvement et de survie que l’été dissimule.", "Cherchez un signe de vie active dans un lieu que vous pensiez endormi.", "L’observation peut approfondir le respect sans prétendre que la nature offre une morale simple.", "Quelle vie continue hors de votre champ d’attention ?"],
  ["L’étang gelé unit profondeur cachée, eau conservée, travail et échanges lointains.", "Remontez la trace d’une ressource ordinaire jusqu’aux personnes et au lieu qui la fournissent.", "Voir les systèmes élargit la responsabilité, mais l’émerveillement ne doit pas en cacher l’exploitation.", "Quel réseau invisible soutient une part ordinaire de votre journée ?"],
  ["La glace qui fond rend le renouveau visible comme un processus physique plutôt qu’une promesse abstraite.", "Repérez un petit changement qui montre qu’une saison ou une habitude commence à tourner.", "Le renouveau est réel, mais il n’efface pas la perte et ne garantit aucun progrès moral.", "Qu’est-ce qui change avant que vous soyez prêt à le nommer ?"],
  ["Une vie peut rester inachevée tout en se tournant vers l’éveil, l’expérience et un horizon plus vaste.", "Choisissez un prochain pas qui garde la recherche ouverte au lieu de la fermer par une certitude.", "Se renouveler demande du courage, mais le départ perpétuel peut fuir les engagements qui méritent de durer.", "Où une vie plus éveillée vous demande-t-elle de commencer ?"],
];

function preview(text) {
  if (text.length <= 300) return text;
  const shortened = text.slice(0, 300);
  return `${shortened.slice(0, shortened.lastIndexOf(" "))}…`;
}

function localeContent(source, locale) {
  const [essentialIdea, practice, tension, prompt] = (locale === "en" ? guidance : guidanceFr)[source.chapter - 1];
  const title = source.titles[locale];
  return {
    language: locale,
    title,
    preview: preview(source[locale].text[0]),
    text: source[locale].text,
    translationNote: locale === "en"
      ? "Complete text from Henry David Thoreau’s 1854 first edition, via Wikisource."
      : "Traduction intégrale du domaine public par Louis Fabulet (1922), via Wikisource.",
    essentialIdea,
    practice,
    tension,
    prompt,
    placeholder: locale === "en"
      ? `Dear Thoreau,\n\nAfter “${title},” I notice…`
      : `Cher Thoreau,\n\nAprès « ${title} », je remarque…`,
    notes: [],
  };
}

export const thoreauReadings = publicWalden.map((source) => ({
  number: source.number,
  author: "Henry David Thoreau",
  authorId: "thoreau",
  work: { en: "Walden", fr: "Walden ou la vie dans les bois" },
  code: source.code,
  sources: source.sources,
  en: localeContent(source, "en"),
  fr: localeContent(source, "fr"),
}));
