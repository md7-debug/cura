import { publicEmersonEssays } from "./publicEmersonEssays.generated.js";
import { publicEmersonSelfReliance } from "./publicEmersonSelfReliance.generated.js";

const guides = [
  {
    en: ["Keep independence and sympathy", "Solitude preserves an independent mind; society tests and applies what solitude reveals. Emerson asks us to keep both without becoming isolated or absorbed by the crowd.", "Protect one quiet interval, then bring one clear conviction from it into a real conversation.", "Solitude can become proud and society can become vulgar. The task is not choosing one side, but keeping a living relation between them.", "Where do you need more solitude, and where do you need more sympathy?"],
    fr: ["Garder l’indépendance et la sympathie", "La solitude préserve un esprit indépendant ; la société éprouve et applique ce qu’elle révèle. Emerson demande de garder les deux sans s’isoler ni se dissoudre dans la foule.", "Protégez un temps de silence, puis portez une conviction claire dans une conversation réelle.", "La solitude peut devenir orgueilleuse et la société vulgaire. La tâche consiste à maintenir une relation vivante entre elles.", "Où avez-vous besoin de plus de solitude, et où de plus de sympathie ?"],
  },
  {
    en: ["The work of civilization", "Civilization grows through association, moral purpose, useful invention, and the power to turn obstacles into shared capacity.", "Improve one ordinary system so that it asks less waste and gives more freedom to others.", "Technical progress enlarges power, but Emerson insists that moral ends determine whether that power deserves the name civilization.", "What form of progress would make your surroundings more humane?"],
    fr: ["Le travail de la civilisation", "La civilisation grandit par l’association, la finalité morale, l’invention utile et la capacité de transformer les obstacles en puissance commune.", "Améliorez un système ordinaire afin qu’il demande moins de gaspillage et donne plus de liberté aux autres.", "Le progrès technique augmente la puissance, mais les fins morales décident si cette puissance mérite le nom de civilisation.", "Quel progrès rendrait votre milieu plus humain ?"],
  },
  {
    en: ["Beauty must become life", "Art does not belong only to museums or inherited forms. It arises when a living mind gives beauty and meaning to the materials of its own time.", "Take one useful object or routine and improve its form with restraint and care.", "Art can reveal the ideal in ordinary life, yet decoration without truth only disguises poor purposes.", "What part of daily life is waiting to be shaped with care?"],
    fr: ["La beauté doit devenir vie", "L’art n’appartient pas seulement aux musées ni aux formes héritées. Il naît lorsqu’un esprit vivant donne beauté et sens aux matériaux de son temps.", "Prenez un objet ou une habitude utile et améliorez sa forme avec mesure et soin.", "L’art peut révéler l’idéal dans la vie ordinaire, mais l’ornement sans vérité ne fait que masquer de mauvaises fins.", "Quelle part de votre vie quotidienne attend d’être façonnée avec soin ?"],
  },
  {
    en: ["Speech with force", "Eloquence joins a necessary truth, a fitting occasion, and a speaker whose whole presence carries the thought.", "Say one necessary thing plainly, with the listener and the moment fully in view.", "Powerful speech can serve truth or manipulation. Force alone is not evidence of worth.", "What truth needs a clearer voice from you?"],
    fr: ["Une parole qui porte", "L’éloquence unit une vérité nécessaire, une occasion juste et un orateur dont la présence entière porte la pensée.", "Dites clairement une chose nécessaire, en gardant l’auditeur et le moment pleinement en vue.", "Une parole puissante peut servir la vérité ou la manipulation. La force seule ne prouve pas la valeur.", "Quelle vérité demande de votre part une voix plus claire ?"],
  },
  {
    en: ["The education of home", "Domestic life gives affection, responsibility, limits, and daily work a common place. Its small duties educate character more steadily than display.", "Give full attention to one unnoticed act that makes home more habitable for another person.", "Home can protect and form us, but it can also narrow life when affection becomes possession or custom resists growth.", "What quiet duty at home is forming your character?"],
    fr: ["L’éducation du foyer", "La vie domestique réunit l’affection, la responsabilité, les limites et le travail quotidien. Ses petits devoirs forment le caractère plus sûrement que le spectacle.", "Donnez toute votre attention à un acte discret qui rend le foyer plus habitable pour une autre personne.", "Le foyer peut protéger et former, mais aussi rétrécir la vie lorsque l’affection devient possession ou que l’habitude refuse la croissance.", "Quel devoir silencieux du foyer forme votre caractère ?"],
  },
  {
    en: ["Learning from the ground", "Farming places effort inside seasons, limits, and consequences. The land corrects abstraction through repeated contact with what grows.", "Do one task whose result depends on patient care rather than immediate response.", "Emerson’s praise of farming can idealize labor; the useful insight lies in its discipline of attention, dependence, and time.", "What reality would correct you if you worked closer to it?"],
    fr: ["Apprendre du sol", "Le travail de la terre place l’effort dans les saisons, les limites et les conséquences. Le sol corrige l’abstraction par le contact répété avec ce qui pousse.", "Faites une tâche dont le résultat dépend d’un soin patient plutôt que d’une réponse immédiate.", "L’éloge de la vie rustique peut idéaliser le travail ; sa leçon tient à la discipline de l’attention, de la dépendance et du temps.", "Quelle réalité vous corrigerait si vous travailliez plus près d’elle ?"],
  },
  {
    en: ["Use the day’s tools", "Tools extend human powers, but time remains the measure of their value. A device serves us only when it helps a worthy act occupy the day.", "Choose one tool you will use deliberately and one you will leave aside today.", "Efficiency can recover time or fill every recovered minute with more demands.", "Which tool serves your day, and which one now directs it?"],
    fr: ["Employer les outils du jour", "Les outils prolongent nos forces, mais le temps reste la mesure de leur valeur. Un dispositif nous sert lorsqu’il aide un acte digne à prendre place dans la journée.", "Choisissez un outil à employer délibérément et un autre à laisser de côté aujourd’hui.", "L’efficacité peut rendre du temps ou remplir chaque minute gagnée de nouvelles exigences.", "Quel outil sert votre journée, et lequel la dirige désormais ?"],
  },
  {
    en: ["Read for transformation", "Books preserve encounters with strong minds, but purchase and accumulation do not improve a reader. Reading matters when it changes perception and conduct.", "Read one paragraph twice and write the action or question it leaves in you.", "The canon can guide attention, yet inherited authority must not replace direct judgment or exclude unfamiliar voices.", "Which book has changed what you notice, not only what you know?"],
    fr: ["Lire pour être transformé", "Les livres conservent la rencontre avec des esprits forts, mais l’achat et l’accumulation n’améliorent pas le lecteur. La lecture compte lorsqu’elle change la perception et la conduite.", "Lisez deux fois un paragraphe et écrivez l’action ou la question qu’il laisse en vous.", "Le canon peut guider l’attention, mais l’autorité héritée ne doit ni remplacer le jugement direct ni exclure les voix inconnues.", "Quel livre a changé ce que vous remarquez, et non seulement ce que vous savez ?"],
  },
  {
    en: ["Conversation as a tonic", "Good company tempers thought with affection and practice. Conversation works when people meet through affinity, attention, and a real subject.", "Invite one person into a conversation with a question that cannot be answered by news alone.", "A chosen circle can deepen thought, but exclusiveness can protect comfort more than truth.", "Which conversation leaves you more alive and more exact?"],
    fr: ["La conversation comme tonique", "Une bonne compagnie tempère la pensée par l’affection et la pratique. La conversation agit lorsque les personnes se rencontrent par affinité, attention et autour d’un sujet réel.", "Invitez une personne à une conversation par une question qui ne se réduit pas aux nouvelles.", "Un cercle choisi peut approfondir la pensée, mais l’exclusion protège parfois le confort plus que la vérité.", "Quelle conversation vous laisse plus vivant et plus précis ?"],
  },
  {
    en: ["Courage for the fact", "Courage is not noise or the absence of fear. It is the strength to see a fact, keep one’s place, and act without surrendering judgment.", "Name one fact you have avoided and take the smallest honest action it requires.", "Boldness can imitate courage. Real courage remains answerable to truth, proportion, and other people.", "What fact asks you to stand more steadily?"],
    fr: ["Le courage devant le fait", "Le courage n’est ni le bruit ni l’absence de peur. Il est la force de voir un fait, de tenir sa place et d’agir sans abandonner son jugement.", "Nommez un fait évité et accomplissez le plus petit acte honnête qu’il exige.", "L’audace peut imiter le courage. Le courage réel reste responsable devant la vérité, la mesure et les autres.", "Quel fait vous demande de tenir plus fermement ?"],
  },
  {
    en: ["An inward measure of success", "Success comes from the full use of one’s powers and a faithful relation to reality, not from applause added after the act.", "Define today’s success in one sentence that contains no rank, audience, or comparison.", "Self-trust protects purpose, but it still needs correction from consequences and the claims of other people.", "What would count as success if no one saw it?"],
    fr: ["Une mesure intérieure du succès", "Le succès vient du plein usage de ses forces et d’une relation fidèle au réel, non des applaudissements ajoutés après l’acte.", "Définissez le succès du jour en une phrase sans rang, public ni comparaison.", "La confiance en soi protège l’intention, mais elle doit encore répondre aux conséquences et aux droits des autres.", "Qu’est-ce qui compterait comme succès si personne ne le voyait ?"],
  },
  {
    en: ["The gifts of age", "Age takes some powers and clarifies others: selection, proportion, memory, gratitude, and freedom from demands that no longer deserve obedience.", "Release one outdated expectation and use the attention it returns.", "Respect for age must not romanticize pain, exclusion, or the unequal conditions in which people grow old.", "What can this season teach that an earlier one could not?"],
    fr: ["Les dons de l’âge", "L’âge retire certaines forces et en clarifie d’autres : le choix, la mesure, la mémoire, la gratitude et la liberté devant des exigences qui ne méritent plus obéissance.", "Relâchez une attente dépassée et employez l’attention qu’elle vous rend.", "Le respect de l’âge ne doit pas idéaliser la douleur, l’exclusion ni les conditions inégales dans lesquelles on vieillit.", "Que peut enseigner cette saison qu’une saison antérieure ne pouvait enseigner ?"],
  },
  {
    en: ["Trust the thought that is yours", "Self-reliance begins by hearing one’s inward conviction before habit, approval, and inherited authority silence it. Emerson joins this trust to work, responsibility, and direct contact with reality.", "Name one conviction you have softened for approval. Give it one honest sentence and one proportionate action today.", "An inward measure can resist conformity, but it is not permission to ignore facts, consequences, or other people. Self-trust remains answerable to truth.", "Where are you borrowing permission for a life that asks for your own judgment?"],
    fr: ["Faire confiance à sa propre pensée", "La confiance en soi commence par l’écoute d’une conviction intérieure avant que l’habitude, l’approbation et l’autorité héritée ne la réduisent au silence. Emerson unit cette confiance au travail, à la responsabilité et au contact direct avec le réel.", "Nommez une conviction que vous avez atténuée pour obtenir l’approbation. Donnez-lui aujourd’hui une phrase honnête et un acte mesuré.", "Une mesure intérieure peut résister au conformisme, mais elle n’autorise pas à ignorer les faits, les conséquences ni les autres. La confiance en soi reste responsable devant la vérité.", "Où cherchez-vous une permission extérieure pour une vie qui demande votre propre jugement ?"],
  },
];

function preview(text) {
  if (text.length <= 300) return text;
  const shortened = text.slice(0, 300);
  return `${shortened.slice(0, shortened.lastIndexOf(" "))}…`;
}

function localizedGuide(values) {
  const [title, essentialIdea, practice, tension, prompt] = values;
  return { title, essentialIdea, practice, tension, prompt };
}

const sourceEssays = [...publicEmersonEssays, publicEmersonSelfReliance];

export const emersonReadings = sourceEssays.map((sourceEssay, index) => {
  const enGuide = localizedGuide(guides[index].en);
  const frGuide = localizedGuide(guides[index].fr);
  const isSelfReliance = sourceEssay === publicEmersonSelfReliance;
  return {
    number: 301 + index,
    author: "Ralph Waldo Emerson",
    authorId: "emerson",
    work: {
      en: `${sourceEssay.collection?.en ?? "Society and Solitude"} · ${sourceEssay.titles.en}`,
      fr: `${sourceEssay.collection?.fr ?? "Société et Solitude"} · ${sourceEssay.titles.fr}`,
    },
    code: sourceEssay.code ?? {
      en: `ESSAY ${index + 1}`,
      fr: `ESSAI ${index + 1}`,
    },
    sources: sourceEssay.sources,
    en: {
      ...enGuide,
      preview: preview(sourceEssay.en.text[0]),
      text: sourceEssay.en.text,
      translationNote: isSelfReliance
        ? "Complete 1841 public-domain text by Ralph Waldo Emerson, via Project Gutenberg."
        : "Complete 1870 public-domain text by Ralph Waldo Emerson, via Project Gutenberg.",
      placeholder: `Dear Emerson,\n\nAfter “${sourceEssay.titles.en},” I notice…`,
      notes: [],
    },
    fr: {
      ...frGuide,
      preview: preview(sourceEssay.fr.text[0]),
      text: sourceEssay.fr.text,
      translationNote: isSelfReliance
        ? "Traduction intégrale de 1851 par Émile Montégut (1825–1895), domaine public, d’après le scan Gallica."
        : "Traduction intégrale de 1911 par Marie Dugard (1862–1932), domaine public, via Wikisource.",
      placeholder: `Cher Emerson,\n\nAprès « ${sourceEssay.titles.fr} », je remarque…`,
      notes: [],
    },
  };
});
