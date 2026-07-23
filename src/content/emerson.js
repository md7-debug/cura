import { publicEmersonEssays } from "./publicEmersonEssays.generated.js";
import { publicEmersonRequested } from "./publicEmersonRequested.generated.js";
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

const requestedGuides = {
  "nature-1836": {
    en: ["Recover an original relation", "Nature becomes more than scenery when attention meets it directly. Emerson asks the reader to see the world before habit and inherited language make it ordinary.", "Spend ten quiet minutes with one natural object. Describe only what you can observe before naming what it means.", "Emerson’s unity can make conflict and material limits seem easier than they are. Direct perception still needs history, science, and responsibility.", "What becomes visible when you stop treating nature as background?"],
    fr: ["Retrouver une relation originelle", "La nature devient plus qu’un décor lorsque l’attention la rencontre directement. Emerson invite à voir le monde avant que l’habitude et le langage hérité ne le rendent ordinaire.", "Passez dix minutes en silence avec un élément naturel. Décrivez seulement ce que vous observez avant de lui donner un sens.", "L’unité proposée par Emerson peut simplifier les conflits et les limites matérielles. La perception directe a encore besoin d’histoire, de science et de responsabilité.", "Que voyez-vous lorsque la nature cesse d’être un simple arrière-plan ?"],
  },
  history: {
    en: ["Read history from within", "The past is not a cabinet of remote facts. Emerson reads it as the record of powers and possibilities that remain active in every person.", "Choose one historical life and name the human capacity it makes present for you now.", "Finding oneself in history can awaken agency, but it can also erase real differences of time, power, and circumstance.", "Which part of the past feels alive in a choice you face today?"],
    fr: ["Lire l’histoire depuis soi", "Le passé n’est pas une réserve de faits lointains. Emerson le lit comme la trace de forces et de possibilités encore actives en chacun.", "Choisissez une vie historique et nommez la capacité humaine qu’elle rend présente aujourd’hui.", "Se reconnaître dans l’histoire peut éveiller l’action, mais aussi effacer les différences réelles d’époque, de pouvoir et de situation.", "Quelle part du passé demeure vivante dans un choix d’aujourd’hui ?"],
  },
  compensation: {
    en: ["See the whole account", "Every gain carries a cost and every action alters the person who performs it. Compensation names the balance woven through conduct, not a promise of quick reward.", "For one desire, write the benefit you seek and the price you are willing to pay without self-deception.", "Moral balance can become cruel when it treats suffering as deserved. Unequal conditions are not cancelled by a metaphysical law.", "What cost have you kept outside the account?"],
    fr: ["Voir le compte entier", "Tout gain porte un coût et toute action transforme celui qui l’accomplit. La compensation nomme un équilibre inscrit dans la conduite, non la promesse d’une récompense rapide.", "Pour un désir, écrivez le bien recherché et le prix que vous acceptez de payer sans vous tromper.", "L’idée d’équilibre moral devient cruelle lorsqu’elle présente la souffrance comme méritée. Les inégalités ne disparaissent pas dans une loi métaphysique.", "Quel coût avez-vous laissé hors du compte ?"],
  },
  "over-soul": {
    en: ["Listen beneath the separate self", "Emerson describes a shared depth of consciousness in which truth is received before it is possessed. Insight asks for receptivity more than display.", "Sit without input for five minutes. Write the clearest sentence that remains when the urge to impress falls away.", "A universal soul can illuminate kinship, yet its abstraction can obscure embodied difference and particular lives.", "What do you know most clearly when no audience is present?"],
    fr: ["Écouter sous le moi séparé", "Emerson décrit une profondeur commune de la conscience où la vérité est reçue avant d’être possédée. L’intuition demande plus de disponibilité que de démonstration.", "Restez cinq minutes sans apport extérieur. Écrivez la phrase la plus claire lorsque le désir d’impressionner disparaît.", "Une âme universelle éclaire la parenté, mais son abstraction peut masquer les différences vécues et les vies particulières.", "Que savez-vous le plus clairement lorsqu’aucun public n’est présent ?"],
  },
  circles: {
    en: ["Let every conclusion reopen", "Each settled boundary becomes the edge of a wider view. Growth depends on allowing a true idea to revise the circle that once contained it.", "Take one certainty and write the next honest question around it.", "Endless revision can become restlessness. A larger circle still has to support a decision and a life.", "Which conclusion has become too small for what you now see?"],
    fr: ["Rouvrir chaque conclusion", "Toute limite établie devient le bord d’une vue plus large. Grandir demande qu’une idée vraie révise le cercle qui la contenait.", "Prenez une certitude et écrivez autour d’elle la prochaine question honnête.", "La révision sans fin peut devenir agitation. Un cercle plus large doit encore soutenir une décision et une vie.", "Quelle conclusion est devenue trop étroite pour ce que vous voyez maintenant ?"],
  },
  poet: {
    en: ["Give the world its living name", "The poet perceives relations others pass over and gives them language. Naming becomes an act of attention that restores life to familiar things.", "Describe one ordinary scene with one exact image you have never used before.", "The solitary genius can hide the collective sources of language and art. Original speech still grows through inheritance and exchange.", "What familiar thing is waiting for a truer name?"],
    fr: ["Donner au monde son nom vivant", "Le poète perçoit des relations que d’autres négligent et leur donne une langue. Nommer devient un acte d’attention qui rend la vie aux choses familières.", "Décrivez une scène ordinaire avec une image précise que vous n’avez jamais employée.", "Le génie solitaire peut masquer les sources collectives de la langue et de l’art. La parole originale grandit aussi par l’héritage et l’échange.", "Quelle chose familière attend un nom plus juste ?"],
  },
  experience: {
    en: ["Meet the day without possession", "Experience resists our wish to hold life still. Temperament, grief, surprise, and ordinary events keep changing the angle from which the world appears.", "Name what today actually gave you, apart from what you expected it to give.", "Fluidity protects us from rigid certainty, but detachment can become an excuse not to grieve, commit, or repair.", "What changes when you release the day you had planned?"],
    fr: ["Rencontrer le jour sans le posséder", "L’expérience résiste à notre désir d’immobiliser la vie. Le tempérament, le deuil, la surprise et les événements ordinaires changent sans cesse l’angle du monde.", "Nommez ce que ce jour vous a réellement donné, séparément de ce que vous en attendiez.", "La fluidité protège des certitudes rigides, mais le détachement peut servir d’excuse pour ne pas pleurer, s’engager ou réparer.", "Que change le renoncement au jour que vous aviez prévu ?"],
  },
  politics: {
    en: ["Make institutions answer to character", "The state has value when it protects persons and enlarges their capacity for responsible action. Institutions remain instruments, not the final source of moral authority.", "Choose one civic duty and perform its smallest concrete form today.", "Distrust of the state can defend liberty, but it can also ignore the public structures needed to restrain power and secure equal rights.", "Where does your private conviction require public responsibility?"],
    fr: ["Soumettre les institutions au caractère", "L’État a de la valeur lorsqu’il protège les personnes et augmente leur capacité d’action responsable. Les institutions restent des instruments, non la source ultime de l’autorité morale.", "Choisissez un devoir civique et accomplissez aujourd’hui sa forme la plus concrète.", "La méfiance envers l’État peut défendre la liberté, mais aussi ignorer les structures publiques nécessaires pour limiter le pouvoir et garantir des droits égaux.", "Où votre conviction privée exige-t-elle une responsabilité publique ?"],
  },
  "new-england-reformers": {
    en: ["Join reform to a whole life", "Reform loses force when a single cause consumes the person or repeats the coercion it opposes. Durable change asks for integrity in means, habits, and relations.", "Examine one cause you support. Align one ordinary habit with it today.", "Emerson’s suspicion of organized reform can undervalue collective action and the urgency faced by people harmed now.", "Does your way of changing the world resemble the world you want?"],
    fr: ["Relier la réforme à une vie entière", "La réforme perd sa force lorsqu’une seule cause absorbe la personne ou répète la contrainte qu’elle combat. Un changement durable exige de la cohérence dans les moyens, les habitudes et les relations.", "Examinez une cause que vous soutenez. Accordez aujourd’hui une habitude ordinaire avec elle.", "La méfiance d’Emerson envers la réforme organisée peut sous-estimer l’action collective et l’urgence vécue par ceux qui souffrent maintenant.", "Votre manière de changer le monde ressemble-t-elle au monde désiré ?"],
  },
  saadi: {
    en: ["Keep the singer’s solitude", "The poem imagines the maker as both solitary and answerable to a human audience. The work ripens away from noise, then returns as a gift.", "Protect one interval for work without reaction, metrics, or commentary.", "Solitude can concentrate a voice, but the myth of the isolated creator can conceal dependence, privilege, and collaboration.", "What work needs silence before it can be shared?"],
    fr: ["Garder la solitude du chant", "Le poème imagine le créateur à la fois solitaire et responsable devant un public humain. L’œuvre mûrit loin du bruit, puis revient comme un don.", "Protégez un temps de travail sans réaction, mesure ni commentaire.", "La solitude peut concentrer une voix, mais le mythe du créateur isolé peut cacher les dépendances, les privilèges et la collaboration.", "Quel travail a besoin de silence avant d’être partagé ?"],
  },
  "american-scholar": {
    en: ["Become a person who thinks", "Books, nature, and action educate the scholar when each serves living judgment. Learning fails when the reader becomes only a receiver of other minds.", "After today’s reading, write one claim in your own words and test it in one action.", "Independence of thought needs sources, correction, and community. Originality is not freedom from evidence.", "What have you read that now asks to become your own thought?"],
    fr: ["Devenir une personne qui pense", "Les livres, la nature et l’action forment le savant lorsque chacun sert un jugement vivant. L’apprentissage échoue si le lecteur reste seulement le récepteur d’autres esprits.", "Après la lecture, formulez une idée avec vos mots et éprouvez-la dans une action.", "L’indépendance de pensée a besoin de sources, de correction et de communauté. L’originalité ne libère pas des preuves.", "Quelle lecture demande maintenant à devenir votre propre pensée ?"],
  },
  fate: {
    en: ["Work inside necessity", "Fate names the conditions we did not choose; freedom appears in the power that meets, interprets, and redirects them. Emerson holds limitation and agency together.", "Write one fixed condition and one move that remains yours within it.", "The essay also contains false and harmful nineteenth-century claims about racial hierarchy and physiology. They belong to its history, not to reliable science.", "What becomes possible once you stop arguing with one fixed fact?"],
    fr: ["Agir dans la nécessité", "Le destin nomme les conditions que nous n’avons pas choisies ; la liberté apparaît dans la force qui les rencontre, les interprète et les réoriente. Emerson tient ensemble limite et action.", "Écrivez une condition fixe et un geste qui demeure vôtre en son sein.", "L’essai contient aussi des affirmations fausses et nuisibles du XIXe siècle sur la hiérarchie raciale et la physiologie. Elles appartiennent à son histoire, non à une science fiable.", "Que devient possible lorsque vous cessez de contester un fait immuable ?"],
  },
};

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
}).concat(publicEmersonRequested.map((sourceEssay, index) => {
  const guide = requestedGuides[sourceEssay.slug];
  const enGuide = localizedGuide(guide.en);
  const frGuide = localizedGuide(guide.fr);
  return {
    number: 314 + index,
    author: "Ralph Waldo Emerson",
    authorId: "emerson",
    work: {
      en: `${sourceEssay.collection} · ${sourceEssay.title}`,
      fr: `${sourceEssay.frenchCollection} · ${sourceEssay.frenchTitle}`,
    },
    code: { en: sourceEssay.code, fr: sourceEssay.code },
    sources: { en: sourceEssay.source, fr: sourceEssay.source },
    en: {
      ...enGuide,
      language: "en",
      preview: preview(sourceEssay.text[0]),
      text: sourceEssay.text,
      translationNote: "Complete original text from a public-domain edition, via Project Gutenberg or Wikisource.",
      placeholder: `Dear Emerson,\n\nAfter “${sourceEssay.title},” I notice…`,
      notes: [],
    },
    fr: {
      ...frGuide,
      language: "en",
      preview: preview(sourceEssay.text[0]),
      text: sourceEssay.text,
      translationNote: "Texte original anglais intégral, provenant d’une édition du domaine public. Aucune traduction française non vérifiée n’est présentée.",
      placeholder: `Cher Emerson,\n\nAprès « ${sourceEssay.frenchTitle} », je remarque…`,
      notes: [],
    },
  };
}));
