import { yearsExperience } from "../../utils/experience.ts";
import type { Messages } from "../messages.ts";

const es: Messages = {
  site: {
    tagline: "diseñado con intención. construido con oficio.",
    pageTitle: "Jane Doe - Ingeniera frontend",
    skipLinkLabel: "Saltar al contenido principal",
    sectionErrorMessage: "Lo sentimos, no se pudo cargar esta sección.",
    defaultLogoAlt: "Predeterminado",
  },
  languageCopy: {
    label: "Idioma (Language)",
    disclaimer: "Traducción asistida por IA; puede contener errores. El original está en inglés.",
    readInEnglish: "Read in English",
  },
  loader: { enterText: "INICIANDO", portfolioLabel: "PORTAFOLIO" },
  navLinks: {
    about: { label: "sobre mí" },
    skills: { label: "habilidades", title: "habilidades y stack" },
    projects: { label: "proyectos" },
    oss: { label: "oss", title: "código abierto" },
    experience: { label: "experiencia", title: "trayectoria" },
    education: { label: "formación" },
    awards: { label: "premios" },
    contact: { label: "contacto" },
  },
  navMenuLabel: { open: "Abrir menú", close: "Cerrar menú" },
  availability: {
    compact: "disponible",
    full: "disponible para trabajar",
    statuses: ["DISPONIBLE PARA TRABAJAR", "ABIERTO A JORNADA COMPLETA", "FREELANCE · CONSULTORÍA"],
  },
  availabilitySince: (since) => `desde ${since}`,
  availabilityLinkSuffix: " - ponte en contacto",
  hero: {
    eyebrow: "Ingeniera frontend sénior · Sistemas de diseño y accesibilidad",
    roles: { frontend: "Ingeniería frontend", design: "Sistemas de diseño" },
    taglineHtml:
      "Un <b>eslogan</b> breve y directo sobre lo que construyes y lo que te <b>distingue</b>. Una o dos frases como máximo.",
    ctaPrimary: "ver mi trabajo →",
    ctaGhost: "descargar CV",
    floatChips: {
      stack: "TypeScript · React",
      a11y: "Accesibilidad · Rendimiento",
      years: `${yearsExperience} años de ingeniería`,
    },
  },
  stats: {
    years: "años en desarrollo de software",
    degree: "Informática - Tu universidad",
    oss: "colaboradora de código abierto",
  },
  about: {
    headlineHtml: `${yearsExperience} años construyendo para la web.<br/><em>Sustituye esto</em> por tu propia historia en una línea.`,
    bodyHtml:
      "Uno o dos párrafos sobre ti: qué construyes, cómo trabajas y qué te importa. Usa <b>negrita</b> para las frases que el lector debe recordar.<br/><br/>Todo lo que hay en esta página sale de <b>src/site.config.ts</b> y de los archivos de idioma en <b>src/i18n/locales/</b>, así que cambias el contenido sin tocar los componentes.",
  },
  impactTitle: "impacto de un vistazo",
  impact: {
    users: { label: "usuarios al mes", context: "en los productos que he ayudado a lanzar" },
    components: { label: "componentes reutilizables", context: "en un sistema de diseño compartido" },
    teams: { label: "equipos apoyados", context: "que usan la misma librería de componentes" },
    speed: { label: "carga más rápida", context: "tras una mejora a fondo del rendimiento" },
  },
  skillCategories: {
    frontend: "arquitectura frontend",
    styling: "css y estilos",
    tooling: "herramientas y build",
    testing: "testing",
  },
  viewProjectLabel: "Ver proyecto",
  projects: {
    designSystem: {
      type: "sistema de diseño",
      desc: "Una librería de componentes de React personalizable con la accesibilidad integrada: teclado, foco visible y contraste de color comprobados en CI. Sustitúyelo por tu proyecto estrella.",
    },
    dashboard: {
      type: "aplicación web",
      desc: "Un panel de analítica en tiempo real con gráficos renderizados en el servidor y filtros que siguen siendo rápidos con grandes volúmenes de datos.",
    },
    checkout: {
      type: "comercio electrónico",
      desc: "Un proceso de pago mobile-first rehecho para ser rápido, con pruebas end-to-end para cada forma de pago.",
    },
  },
  repos: {
    "awesome-ui-kit": "Un kit de UI pequeño y accesible para React.",
    "dev-notes": "Notas y fragmentos a los que siempre vuelvo.",
    "weekend-project": "Un proyecto personal hecho en un fin de semana.",
  },
  experienceNodes: {
    acme: {
      year: "2023 - actualidad",
      role: "Ingeniera frontend sénior",
      detail:
        "Lidera la arquitectura frontend y orienta a un equipo de cinco ingenieros. Crea aplicaciones web rápidas y accesibles que usan millones de personas.",
    },
    techstart: {
      year: "2020 - 2023",
      role: "Ingeniera frontend",
      detail:
        "Desarrolló funciones clave del producto con React y TypeScript y redujo un 40 % el tiempo de carga con trabajo de rendimiento.",
    },
    webworks: {
      year: "2018 - 2020",
      role: "Desarrolladora júnior",
      detail: "Creó sitios web adaptables para clientes de muchos sectores y aprendió a fondo HTML, CSS y JavaScript.",
    },
  },
  educationNodes: {
    degree: {
      degree: "Grado en Informática",
      school: "Tu universidad",
      detail: "Ingeniería de software, algoritmos e interacción persona-ordenador.",
    },
    school: { degree: "Bachillerato", school: "Tu instituto", detail: "Matemáticas, física e informática." },
  },
  awards: {
    excellence: "Premio a la excelencia en ingeniería",
    hackathon: "Ganadora de un hackathon",
  },
  heading: { muted: "construyamos", grad: "algo real." },
  note: "Abierta a nuevas oportunidades y conversaciones interesantes: un puesto fijo, un proyecto freelance o simplemente una charla sobre la web.",
  openTo: ["puestos a tiempo completo", "proyectos freelance", "colaboración en código abierto", "un café virtual"],
  profile: {
    headline: "Ingeniera frontend sénior · Sistemas de diseño",
    location: "Londres, Reino Unido",
    meta: [`${yearsExperience} años en desarrollo de software`, "Grado en Informática · Tu universidad"],
    highlightsHtml: [
      "Dirigió un <b>sistema de diseño</b> que usan seis equipos de producto.",
      "Redujo un <b>40 %</b> el tiempo de carga de un producto con mucho tráfico.",
      "Orienta a otros ingenieros y define los <b>estándares de revisión de código</b> del equipo.",
    ],
  },
  commandGroups: {
    navigate: "navegar",
    actions: "acciones",
    projects: "proyectos",
    social: "en otros sitios",
  },
  commandPalette: {
    dialogLabel: "Paleta de comandos",
    inputLabel: "Buscar comandos",
    placeholder: "Escribe un comando o busca…",
    empty: "No hay comandos que coincidan.",
    resultCount: (n) => (n === 1 ? "1 comando disponible" : `${n} comandos disponibles`),
    copied: "Correo copiado al portapapeles",
    copyFailed: "No se pudo copiar; abriendo tu app de correo",
    triggerText: "buscar",
    footer: { navigate: "navegar", select: "elegir", close: "cerrar" },
  },
  commandLabels: {
    home: "Volver arriba",
    goTo: (title) => `Ir a ${title}`,
    hireMe: "Contrátame",
    prefs: "Preferencias de accesibilidad",
    install: "Instalar como app",
    copyEmail: "Copiar dirección de correo",
    emailMe: "Envíame un correo",
    downloadResume: "Descargar CV",
    printResume: "Imprimir / guardar como PDF",
    openProject: (title) => title,
    openSocial: (label) => `Abrir ${label}`,
    retro: "Inserta una moneda: modo retro",
    switchLanguage: (name) => `Cambiar idioma: ${name}`,
    theme: (name) => `Tema: ${name}`,
    shortcuts: "Atajos de teclado",
  },
  commandHints: {
    copied: "copiado ✓",
    external: "↗",
    download: "pdf",
    prefs: "texto, contraste, movimiento",
    install: "funciona sin conexión",
    printResume: "siempre actualizado",
    retro: "↑↑↓↓←→←→BA",
    themeAuto: "según la hora del día",
    shortcuts: "?",
  },
  commandKeywords: {
    home: "arriba inicio portada top hero start home",
    hireMe: "contratar disponible trabajo empleo puesto jornada completa freelance consultoría hire available work job",
    prefs:
      "a11y accesibilidad preferencias ajustes tamaño texto fuente dislexia contraste movimiento animación cursor subrayar enlaces daltonismo accessibility settings",
    install: "instalar app pwa sin conexión escritorio pantalla de inicio install offline",
    copyEmail: "correo contacto portapapeles mail contact clipboard",
    emailMe: "correo contacto mensaje mail contact message mailto",
    downloadResume: "cv currículum pdf descargar resume download",
    printResume: "imprimir pdf guardar cv currículum papel print save resume",
    language:
      "idioma lengua traducir traducción language translate english spanish french japanese español français 言語",
    retro: "konami cheat secret easter egg retro arcade 8bit crt insert coin",
    theme: "tema color colores apariencia oscuro índigo atardecer ártico automático theme",
    shortcuts: "atajos teclado teclas ayuda shortcuts keyboard",
  },
  easterEgg: {
    toastOn: "Truco aceptado: modo retro activado. Vuelve a introducirlo para desactivarlo.",
    toastOff: "Modo retro desactivado. De vuelta al presente.",
    consoleTitle: "👾 psst, has encontrado la consola.",
    consoleHint: "Prueba ↑ ↑ ↓ ↓ ← → ← → B A en la página (o busca «konami» con Ctrl/⌘+K).",
  },
  a11yPrefsTrigger: "Preferencias de accesibilidad",
  a11yPrefsCopy: {
    title: "preferencias de accesibilidad",
    intro:
      "Adapta el sitio a tus necesidades. Tus elecciones se guardan en este navegador y se aplican en cada visita.",
    close: "Cerrar preferencias de accesibilidad",
    reset: "restablecer valores",
    toggles: {
      highContrast: {
        label: "alto contraste",
        desc: "Texto más brillante, bordes más marcados y fondo negro puro.",
      },
      readableFont: {
        label: "fuente legible",
        desc: "Atkinson Hyperlegible, diseñada para personas con baja visión.",
      },
      reduceMotion: {
        label: "reducir movimiento",
        desc: "Detiene las animaciones y el desplazamiento suave, aunque tu dispositivo los permita.",
      },
      systemCursor: {
        label: "cursor estándar",
        desc: "Usa el puntero del sistema en lugar del cursor personalizado.",
      },
      underlineLinks: {
        label: "subrayar enlaces",
        desc: "Hace que cada enlace se identifique sin depender del color.",
      },
    },
    textSize: { legend: "tamaño del texto" },
    theme: {
      legend: "tema",
      auto: "automático",
      autoHint: (name) => `según la hora del día · ahora ${name}`,
      names: { indigo: "índigo", sunset: "atardecer", arctic: "ártico" },
    },
    vision: {
      legend: "simulación de visión del color",
      hint: "No es una corrección: es una vista previa de cómo ven esta página las personas con deficiencias en la visión del color.",
      options: {
        none: "desactivada",
        protanopia: "protanopia (sin conos rojos)",
        deuteranopia: "deuteranopia (sin conos verdes)",
        tritanopia: "tritanopia (sin conos azules)",
        achromatopsia: "acromatopsia (sin color)",
      },
    },
  },
  shortcutsCopy: {
    title: "atajos de teclado",
    intro: "Todo en este sitio funciona con el teclado. Estos atajos ahorran tiempo.",
    close: "Cerrar los atajos de teclado",
    footerLink: "atajos de teclado",
    items: {
      palette: "abrir la paleta de comandos",
      search: "abrir la paleta de comandos (rápido)",
      help: "mostrar estos atajos",
      print: "imprimir el currículum o guardarlo como PDF",
      close: "cerrar cualquier diálogo o menú",
      paletteNav: "moverse por los resultados de la paleta y ejecutar uno",
      secret: "hay un secreto… empieza con las flechas",
    },
  },
  pwaCopy: {
    install: "instalar app",
    installHint: "Añade este sitio a tu dispositivo; funciona sin conexión tras una visita",
    updateTitle: "Hay una nueva versión disponible",
    updateBody: "Recarga para ver los últimos cambios.",
    refresh: "recargar",
    dismiss: "Descartar aviso de actualización",
  },
  printResume: {
    sections: {
      summary: "Resumen",
      highlights: "Logros destacados",
      skills: "Habilidades",
      experience: "Experiencia",
      projects: "Proyectos destacados",
      openSource: "Código abierto",
      education: "Formación",
      awards: "Premios",
    },
    footer: (url) => `Impreso desde ${url}; la versión en línea siempre está actualizada.`,
  },
};

export default es;
