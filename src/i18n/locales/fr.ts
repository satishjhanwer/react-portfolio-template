import { yearsExperience } from "../../utils/experience.ts";
import type { Messages } from "../messages.ts";

const fr: Messages = {
  site: {
    tagline: "conçu avec intention. construit avec soin.",
    pageTitle: "Jane Doe - Ingénieure frontend",
    skipLinkLabel: "Aller au contenu principal",
    sectionErrorMessage: "Désolé, une erreur s’est produite lors du chargement de cette section.",
    defaultLogoAlt: "Par défaut",
  },
  languageCopy: {
    label: "Langue (Language)",
    disclaimer: "Traduction assistée par IA, des erreurs sont possibles. L’original est en anglais.",
    readInEnglish: "Read in English",
  },
  loader: { enterText: "INITIALISATION", portfolioLabel: "PORTFOLIO" },
  navLinks: {
    about: { label: "à propos" },
    skills: { label: "compétences", title: "compétences & stack" },
    projects: { label: "projets" },
    oss: { label: "oss", title: "open source" },
    experience: { label: "expérience", title: "parcours" },
    education: { label: "formation" },
    awards: { label: "distinctions" },
    contact: { label: "contact" },
  },
  navMenuLabel: { open: "Ouvrir le menu", close: "Fermer le menu" },
  availability: {
    compact: "disponible",
    full: "disponible pour un poste",
    statuses: ["DISPONIBLE POUR UN POSTE", "OUVERT AU TEMPS PLEIN", "FREELANCE · CONSEIL"],
  },
  availabilitySince: (since) => `à partir de ${since}`,
  availabilityLinkSuffix: " - me contacter",
  hero: {
    eyebrow: "Ingénieure frontend senior · Design systems et accessibilité",
    roles: { frontend: "Ingénierie frontend", design: "Design systems" },
    taglineHtml:
      "Une <b>accroche</b> courte et percutante sur ce que vous construisez et ce qui vous <b>distingue</b>. Une ou deux phrases suffisent.",
    ctaPrimary: "voir mes projets →",
    ctaGhost: "télécharger le CV",
    floatChips: {
      stack: "TypeScript · React",
      a11y: "Accessibilité · Performance",
      years: `${yearsExperience} ans d’ingénierie`,
    },
  },
  stats: {
    years: "ans dans le développement logiciel",
    degree: "Informatique - Votre université",
    oss: "contributrice open source",
  },
  about: {
    headlineHtml: `${yearsExperience} ans à construire pour le web.<br/><em>Remplacez ceci</em> par votre propre histoire en une ligne.`,
    bodyHtml:
      "Un ou deux paragraphes sur vous : ce que vous construisez, votre façon de travailler et ce qui compte pour vous. Mettez en <b>gras</b> les phrases à retenir.<br/><br/>Tout le contenu de cette page vient de <b>src/site.config.ts</b> et des fichiers de langue dans <b>src/i18n/locales/</b> : vous modifiez le contenu sans toucher aux composants.",
  },
  impactTitle: "l’impact en un coup d’œil",
  impact: {
    users: { label: "utilisateurs par mois", context: "sur les produits que j’ai aidé à lancer" },
    components: { label: "composants réutilisables", context: "dans un design system partagé" },
    teams: { label: "équipes accompagnées", context: "qui utilisent la même bibliothèque de composants" },
    speed: { label: "de chargement en moins", context: "après une refonte des performances" },
  },
  skillCategories: {
    frontend: "architecture frontend",
    styling: "css & styles",
    tooling: "outillage & build",
    testing: "tests",
  },
  viewProjectLabel: "Voir le projet",
  projects: {
    designSystem: {
      type: "design system",
      desc: "Une bibliothèque de composants React personnalisable, accessible dès la conception : clavier, focus visible et contraste des couleurs vérifiés en CI. Remplacez-la par votre projet phare.",
    },
    dashboard: {
      type: "application web",
      desc: "Un tableau de bord analytique en temps réel, avec des graphiques rendus côté serveur et des filtres qui restent rapides sur de gros volumes de données.",
    },
    checkout: {
      type: "e-commerce",
      desc: "Un tunnel de paiement mobile-first repensé pour la vitesse, avec des tests de bout en bout pour chaque moyen de paiement.",
    },
  },
  repos: {
    "awesome-ui-kit": "Un petit kit d’UI accessible pour React.",
    "dev-notes": "Des notes et extraits que je consulte souvent.",
    "weekend-project": "Un projet perso construit en un week-end.",
  },
  experienceNodes: {
    acme: {
      year: "2023 - aujourd’hui",
      role: "Ingénieure frontend senior",
      detail:
        "Pilote l’architecture frontend et accompagne une équipe de cinq ingénieurs. Livre des applications web rapides et accessibles utilisées par des millions de personnes.",
    },
    techstart: {
      year: "2020 - 2023",
      role: "Ingénieure frontend",
      detail:
        "A développé des fonctionnalités clés du produit en React et TypeScript, et réduit de 40 % le temps de chargement grâce à un travail sur les performances.",
    },
    webworks: {
      year: "2018 - 2020",
      role: "Développeuse junior",
      detail:
        "A créé des sites responsives pour des clients de nombreux secteurs, en approfondissant HTML, CSS et JavaScript.",
    },
  },
  educationNodes: {
    degree: {
      degree: "Licence d’informatique",
      school: "Votre université",
      detail: "Génie logiciel, algorithmique et interaction humain-machine.",
    },
    school: { degree: "Baccalauréat", school: "Votre lycée", detail: "Mathématiques, physique et informatique." },
  },
  awards: {
    excellence: "Prix d’excellence en ingénierie",
    hackathon: "Lauréate d’un hackathon",
  },
  heading: { muted: "construisons", grad: "du concret." },
  note: "Ouverte aux nouvelles opportunités et aux échanges intéressants : un poste à temps plein, une mission freelance ou simplement une discussion sur le web.",
  openTo: ["postes à temps plein", "missions freelance", "collaboration open source", "un café virtuel"],
  profile: {
    headline: "Ingénieure frontend senior · Design systems",
    location: "Londres, Royaume-Uni",
    meta: [`${yearsExperience} ans dans le développement logiciel`, "Licence d’informatique · Votre université"],
    highlightsHtml: [
      "A dirigé un <b>design system</b> utilisé par six équipes produit.",
      "A réduit de <b>40 %</b> le temps de chargement d’un produit à fort trafic.",
      "Accompagne les ingénieurs et définit les <b>standards de revue de code</b> de l’équipe.",
    ],
  },
  commandGroups: {
    navigate: "naviguer",
    actions: "actions",
    projects: "projets",
    social: "ailleurs",
  },
  commandPalette: {
    dialogLabel: "Palette de commandes",
    inputLabel: "Rechercher une commande",
    placeholder: "Tapez une commande ou recherchez…",
    empty: "Aucune commande correspondante.",
    resultCount: (n) => (n === 1 ? "1 commande disponible" : `${n} commandes disponibles`),
    copied: "Adresse e-mail copiée",
    copyFailed: "Copie impossible, ouverture de votre messagerie",
    triggerText: "rechercher",
    footer: { navigate: "naviguer", select: "choisir", close: "fermer" },
  },
  commandLabels: {
    home: "Retour en haut",
    goTo: (title) => `Aller à ${title}`,
    hireMe: "Me recruter",
    prefs: "Préférences d’accessibilité",
    install: "Installer l’application",
    copyEmail: "Copier l’adresse e-mail",
    emailMe: "M’envoyer un e-mail",
    downloadResume: "Télécharger le CV",
    printResume: "Imprimer / enregistrer en PDF",
    openProject: (title) => title,
    openSocial: (label) => `Ouvrir ${label}`,
    retro: "Insérez une pièce : mode rétro",
    switchLanguage: (name) => `Changer de langue : ${name}`,
    theme: (name) => `Thème : ${name}`,
    shortcuts: "Raccourcis clavier",
  },
  commandHints: {
    copied: "copiée ✓",
    external: "↗",
    download: "pdf",
    prefs: "texte, contraste, animations",
    install: "fonctionne hors ligne",
    printResume: "toujours à jour",
    retro: "↑↑↓↓←→←→BA",
    themeAuto: "selon l'heure",
    shortcuts: "?",
  },
  commandKeywords: {
    home: "haut accueil début top hero start home",
    hireMe: "recruter embaucher disponible emploi poste temps plein freelance conseil hire available work job",
    prefs:
      "a11y accessibilité préférences réglages taille texte police dyslexie contraste animation mouvement curseur souligner liens daltonisme accessibility settings",
    install: "installer application pwa hors ligne bureau écran d’accueil install app offline",
    copyEmail: "e-mail courriel contact presse-papiers mail clipboard",
    emailMe: "e-mail courriel contact message mail mailto",
    downloadResume: "cv curriculum pdf télécharger resume download",
    printResume: "imprimer pdf enregistrer cv papier print save resume",
    language: "langue traduire traduction language translate english spanish french japanese español français 言語",
    retro: "konami cheat secret easter egg retro arcade 8bit crt insert coin",
    theme: "thème couleur apparence sombre indigo crépuscule arctique automatique theme",
    shortcuts: "raccourcis clavier touches aide shortcuts keyboard",
  },
  easterEgg: {
    toastOn: "Code de triche accepté : mode rétro activé. Saisissez-le à nouveau pour revenir.",
    toastOff: "Mode rétro désactivé. Retour au présent.",
    consoleTitle: "👾 psst, vous avez trouvé la console.",
    consoleHint: "Essayez ↑ ↑ ↓ ↓ ← → ← → B A sur la page (ou cherchez « konami » avec Ctrl/⌘+K).",
  },
  a11yPrefsTrigger: "Préférences d’accessibilité",
  a11yPrefsCopy: {
    title: "préférences d’accessibilité",
    intro:
      "Adaptez le site à vos besoins. Vos choix sont enregistrés dans ce navigateur et s’appliquent à chaque visite.",
    close: "Fermer les préférences d’accessibilité",
    reset: "rétablir les valeurs par défaut",
    toggles: {
      highContrast: {
        label: "contraste élevé",
        desc: "Texte plus lumineux, bordures plus marquées, fond noir pur.",
      },
      readableFont: {
        label: "police lisible",
        desc: "Atkinson Hyperlegible, conçue pour les personnes malvoyantes.",
      },
      reduceMotion: {
        label: "réduire les animations",
        desc: "Arrête les animations et le défilement fluide, même si votre appareil les autorise.",
      },
      systemCursor: {
        label: "curseur standard",
        desc: "Utilise le pointeur du système au lieu du curseur personnalisé.",
      },
      underlineLinks: {
        label: "souligner les liens",
        desc: "Rend chaque lien identifiable sans dépendre de la couleur.",
      },
    },
    textSize: { legend: "taille du texte" },
    theme: {
      legend: "thème",
      auto: "automatique",
      autoHint: (name) => `selon l'heure de la journée · actuellement ${name}`,
      names: { indigo: "indigo", sunset: "crépuscule", arctic: "arctique" },
    },
    vision: {
      legend: "simulation de la vision des couleurs",
      hint: "Ce n’est pas une correction, mais un aperçu de la façon dont les personnes ayant un trouble de la vision des couleurs voient cette page.",
      options: {
        none: "désactivée",
        protanopia: "protanopie (pas de cônes rouges)",
        deuteranopia: "deutéranopie (pas de cônes verts)",
        tritanopia: "tritanopie (pas de cônes bleus)",
        achromatopsia: "achromatopsie (pas de couleur)",
      },
    },
  },
  shortcutsCopy: {
    title: "raccourcis clavier",
    intro: "Tout ce site fonctionne au clavier. Ces raccourcis font gagner du temps.",
    close: "Fermer les raccourcis clavier",
    footerLink: "raccourcis clavier",
    items: {
      palette: "ouvrir la palette de commandes",
      search: "ouvrir la palette de commandes (rapide)",
      help: "afficher ces raccourcis",
      print: "imprimer le CV ou l'enregistrer en PDF",
      close: "fermer une boîte de dialogue ou un menu",
      paletteNav: "parcourir les résultats de la palette et en lancer un",
      secret: "il y a un secret… ça commence par les flèches",
    },
  },
  pwaCopy: {
    install: "installer l’app",
    installHint: "Ajoutez ce site à votre appareil ; il fonctionne hors ligne après une visite",
    updateTitle: "Une nouvelle version est disponible",
    updateBody: "Actualisez pour charger les dernières modifications.",
    refresh: "actualiser",
    dismiss: "Ignorer l’avis de mise à jour",
  },
  printResume: {
    sections: {
      summary: "Profil",
      highlights: "Points forts",
      skills: "Compétences",
      experience: "Expérience",
      projects: "Projets choisis",
      openSource: "Open source",
      education: "Formation",
      awards: "Distinctions",
    },
    footer: (url) => `Imprimé depuis ${url} ; la version en ligne est toujours à jour.`,
  },
};

export default fr;
