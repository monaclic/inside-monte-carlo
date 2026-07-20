export type NavigationItem = {
  label: string;
  href: string;
};

export type EditorialCard = {
  asset: string;
  category: string;
  description: string;
  href: string;
  title: string;
};

export type SectionPage = {
  eyebrow: string;
  intro: string;
  paragraphs: string[];
  slug: string;
  title: string;
};

export const navigation: NavigationItem[] = [
  { label: "Accueil", href: "/" },
  { label: "Magazine", href: "/magazine" },
  { label: "La Clé Monte-Carlo", href: "/la-cle-monte-carlo" },
  { label: "Les Gardiens du Geste", href: "/les-gardiens-du-geste" },
  { label: "Les Coulisses", href: "/les-coulisses" },
  { label: "Expériences", href: "/experiences" },
  { label: "Podcasts", href: "/podcasts" },
  { label: "Événements", href: "/evenements" },
  { label: "À propos", href: "/a-propos" },
  { label: "Newsletter", href: "/newsletter" },
];

export const quickNavigation = navigation.slice(1, 5);

export const editorialCards: EditorialCard[] = [
  {
    asset: "IMAGE 01",
    category: "Magazine",
    description:
      "Un récit éditorial à venir, pensé pour regarder Monaco depuis un angle plus intime.",
    href: "/magazine",
    title: "Le Rocher, à l’heure silencieuse",
  },
  {
    asset: "IMAGE 02",
    category: "La Clé Monte-Carlo",
    description:
      "Une adresse, une rencontre et un accès singulier seront révélés dans ce prochain format.",
    href: "/la-cle-monte-carlo",
    title: "Une porte habituellement fermée",
  },
  {
    asset: "IMAGE 03",
    category: "Les Gardiens du Geste",
    description:
      "Portrait à venir de celles et ceux dont le savoir-faire donne forme au temps.",
    href: "/les-gardiens-du-geste",
    title: "Dans l’atelier, le temps du geste",
  },
  {
    asset: "IMAGE 04",
    category: "Les Coulisses",
    description:
      "Une immersion temporaire dans les lieux, les métiers et les détails rarement visibles.",
    href: "/les-coulisses",
    title: "Avant que les portes ne s’ouvrent",
  },
  {
    asset: "IMAGE 05",
    category: "Expériences",
    description:
      "Une sélection éditoriale à venir pour vivre la Principauté autrement.",
    href: "/experiences",
    title: "Monaco, loin du premier regard",
  },
  {
    asset: "IMAGE 06",
    category: "Podcasts",
    description:
      "Une conversation à venir, enregistrée au plus près d’une voix monégasque.",
    href: "/podcasts",
    title: "La voix derrière le lieu",
  },
];

export const sectionPages: SectionPage[] = [
  {
    eyebrow: "Édition 01 · Prochainement",
    intro:
      "Le magazine rassemble des récits, des portraits et des regards consacrés à Monaco, sans céder au bruit ni à l’évidence.",
    paragraphs: [
      "Cette page reprend la structure éditoriale du template. Elle accueillera les articles définitifs sans modification de grille.",
      "Les titres, images, catégories, descriptions et dates présentés ici sont temporaires. Aucun fait ni témoignage n’est inventé.",
    ],
    slug: "magazine",
    title: "Magazine",
  },
  {
    eyebrow: "Accès · Prochainement",
    intro:
      "La Clé Monte-Carlo ouvre des portes habituellement fermées et révèle des lieux à travers celles et ceux qui les font vivre.",
    paragraphs: [
      "Ce format recevra une sélection de récits exclusifs, traités avec retenue et précision.",
      "Le contenu définitif sera intégré après validation éditoriale. La présente page constitue uniquement sa structure.",
    ],
    slug: "la-cle-monte-carlo",
    title: "La Clé Monte-Carlo",
  },
  {
    eyebrow: "Portraits · Prochainement",
    intro:
      "Les Gardiens du Geste donnent la parole aux artisans, créateurs et dépositaires de savoir-faire qui façonnent Monaco.",
    paragraphs: [
      "Chaque portrait prendra le temps de montrer un geste, un rythme et une transmission.",
      "Les personnes et ateliers seront ajoutés uniquement à partir de contenus documentés et validés.",
    ],
    slug: "les-gardiens-du-geste",
    title: "Les Gardiens du Geste",
  },
  {
    eyebrow: "Immersion · Prochainement",
    intro:
      "Les Coulisses regardent ce qui précède l’apparition publique : la préparation, la précision et le travail invisible.",
    paragraphs: [
      "La page est prête à recevoir reportages, séries photographiques et formats courts.",
      "Aucun contenu factuel n’est publié dans cette phase de préparation.",
    ],
    slug: "les-coulisses",
    title: "Les Coulisses",
  },
  {
    eyebrow: "Sélection · Prochainement",
    intro:
      "Expériences propose une lecture éditoriale des lieux et des instants qui méritent d’être vécus avec attention.",
    paragraphs: [
      "La sélection définitive sera concise, indépendante et replacée dans son contexte.",
      "Cette structure est conçue pour accueillir les futurs contenus sans ajouter de nouvelles sections.",
    ],
    slug: "experiences",
    title: "Expériences",
  },
  {
    eyebrow: "Écouter · Prochainement",
    intro:
      "Les podcasts prolongent les récits d’Inside Monte-Carlo dans un format de conversation et d’écoute.",
    paragraphs: [
      "Les épisodes, intervenants et extraits seront ajoutés après production.",
      "Cette page temporaire ne présente aucune citation ni information non vérifiée.",
    ],
    slug: "podcasts",
    title: "Podcasts",
  },
  {
    eyebrow: "Agenda · Prochainement",
    intro:
      "Événements accueillera une sélection resserrée de rendez-vous culturels et éditoriaux liés à la Principauté.",
    paragraphs: [
      "Les dates ne seront publiées qu’après vérification auprès des organisateurs.",
      "La structure est prête pour les futurs rendez-vous, sans contenu fictif.",
    ],
    slug: "evenements",
    title: "Événements",
  },
  {
    eyebrow: "Le média",
    intro:
      "Inside Monte-Carlo est un magazine digital consacré aux histoires que Monaco ne raconte pas.",
    paragraphs: [
      "Sa ligne éditoriale privilégie le temps long, la proximité et la qualité du regard.",
      "Les informations relatives à l’équipe et aux contributeurs seront publiées dans une prochaine phase.",
    ],
    slug: "a-propos",
    title: "À propos",
  },
  {
    eyebrow: "Correspondance",
    intro:
      "La newsletter rassemblera les nouveaux récits, portraits et invitations d’Inside Monte-Carlo.",
    paragraphs: [
      "Le formulaire définitif sera connecté lorsque la solution d’envoi aura été choisie.",
      "Aucune adresse n’est collectée dans cette phase de préparation.",
    ],
    slug: "newsletter",
    title: "Newsletter",
  },
];

export function getSectionPage(slug: string) {
  return sectionPages.find((section) => section.slug === slug);
}
