"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Bilingual, Lang } from "./types";

const STORAGE_KEY = "e2c-lang";

const UI = {
  en: {
    appName: "E2C Pathways",
    tagline: "See your way from here to a career.",
    doorGoal: "Where do I want to go?",
    doorGoalSub: "Browse careers and see every path there.",
    doorNow: "Where am I now?",
    doorNowSub: "Pick your school and see what it leads to.",
    doorWizard: "Not sure? Answer 3 questions",
    storiesHeading: "Students like you",
    storiesSub: "Real paths, followed by real people.",
    fieldsHeading: "Careers by field",
    careersAll: "See all careers",
    exploreHeading: "Our six schools",
    exploreSub: "Free adult education classes near you.",
    youAreHere: "You are here",
    stepLabel: "Step",
    laterLabel: "Later, if you want more",
    nextStepHeading: "Take your next step",
    call: "Call",
    getDirections: "Get directions",
    enroll: "Enroll now",
    print: "Print this plan",
    back: "Back",
    free: "Free",
    perHour: "/hour",
    perYear: "/year",
    demandHigh: "High demand",
    demandMedium: "Steady demand",
    demandGrowing: "Growing field",
    seePathways: "See the paths that lead here",
    seePrograms: "See classes here",
    leadsTo: "This leads to",
    listen: "Listen",
    stopListening: "Stop",
    langButton: "Español",
    wizardTitle: "Let's find your path",
    wizardQ1: "What do you like doing?",
    wizardQ2: "How much time do you have each week?",
    wizardQ3: "What matters most to you?",
    wizardTimeShort: "A little (1–5 hours)",
    wizardTimeMedium: "Some (6–15 hours)",
    wizardTimeLong: "A lot (16+ hours)",
    wizardGoalEarn: "Start earning soon",
    wizardGoalBalanced: "A mix of both",
    wizardGoalDegree: "Work toward a degree",
    wizardResults: "Pathways for you",
    wizardRestart: "Start over",
    wizardStart: "Start the questions",
    wizardStep: "Question",
    of: "of",
    printedFor: "Printed pathway plan",
    printQrHelp: "Scan to open this plan on your phone",
    printedOn: "Printed",
    home: "Home",
    careers: "Careers",
    explore: "Explore schools",
    prototypeBanner:
      "Prototype build. Schools, classes, wages, and pathways shown here are sample data for demonstration only.",
    programsAt: "Classes at",
    classesWord: "classes",
    classWordSingular: "class",
    credential: "You earn",
    duration: "How long",
    cost: "Cost",
    schedule: "Schedule",
    noResults: "Try different answers — every path is here to explore too.",
    notFound: "We couldn't find that page.",
    browseAllPathways: "Browse all pathways",
    allPathwaysHeading: "Every pathway",
    allPathwaysSub: "All the journeys in one place, grouped by field.",
    startsAt: "Starts at",
  },
  es: {
    appName: "E2C Pathways",
    tagline: "Mira tu camino de aquí a una carrera.",
    doorGoal: "¿A dónde quiero llegar?",
    doorGoalSub: "Explora carreras y mira cada camino hacia ellas.",
    doorNow: "¿Dónde estoy ahora?",
    doorNowSub: "Elige tu escuela y mira a dónde te lleva.",
    doorWizard: "¿No estás seguro? Responde 3 preguntas",
    storiesHeading: "Estudiantes como tú",
    storiesSub: "Caminos reales, seguidos por personas reales.",
    fieldsHeading: "Carreras por área",
    careersAll: "Ver todas las carreras",
    exploreHeading: "Nuestras seis escuelas",
    exploreSub: "Clases gratuitas de educación para adultos cerca de ti.",
    youAreHere: "Estás aquí",
    stepLabel: "Paso",
    laterLabel: "Más adelante, si quieres seguir",
    nextStepHeading: "Da tu siguiente paso",
    call: "Llamar",
    getDirections: "Cómo llegar",
    enroll: "Inscríbete ahora",
    print: "Imprimir este plan",
    back: "Atrás",
    free: "Gratis",
    perHour: "/hora",
    perYear: "/año",
    demandHigh: "Alta demanda",
    demandMedium: "Demanda constante",
    demandGrowing: "Área en crecimiento",
    seePathways: "Ver los caminos hacia aquí",
    seePrograms: "Ver clases aquí",
    leadsTo: "Esto lleva a",
    listen: "Escuchar",
    stopListening: "Detener",
    langButton: "English",
    wizardTitle: "Encontremos tu camino",
    wizardQ1: "¿Qué te gusta hacer?",
    wizardQ2: "¿Cuánto tiempo tienes cada semana?",
    wizardQ3: "¿Qué es más importante para ti?",
    wizardTimeShort: "Poco (1–5 horas)",
    wizardTimeMedium: "Algo (6–15 horas)",
    wizardTimeLong: "Mucho (16+ horas)",
    wizardGoalEarn: "Empezar a ganar pronto",
    wizardGoalBalanced: "Un poco de ambos",
    wizardGoalDegree: "Trabajar hacia un título",
    wizardResults: "Caminos para ti",
    wizardRestart: "Empezar de nuevo",
    wizardStart: "Empezar las preguntas",
    wizardStep: "Pregunta",
    of: "de",
    printedFor: "Plan de camino impreso",
    printQrHelp: "Escanea para abrir este plan en tu teléfono",
    printedOn: "Impreso",
    home: "Inicio",
    careers: "Carreras",
    explore: "Explorar escuelas",
    prototypeBanner:
      "Versión de prueba. Las escuelas, clases, salarios y caminos aquí son datos de muestra solo para demostración.",
    programsAt: "Clases en",
    classesWord: "clases",
    classWordSingular: "clase",
    credential: "Obtienes",
    duration: "Duración",
    cost: "Costo",
    schedule: "Horario",
    noResults: "Prueba otras respuestas — también puedes explorar todos los caminos.",
    notFound: "No pudimos encontrar esa página.",
    browseAllPathways: "Ver todos los caminos",
    allPathwaysHeading: "Todos los caminos",
    allPathwaysSub: "Todos los caminos en un solo lugar, agrupados por área.",
    startsAt: "Empieza en",
  },
} as const;

export type UiStrings = Record<keyof typeof UI.en, string>;

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (b: Bilingual) => string;
  ui: UiStrings;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

let storeListeners: Array<() => void> = [];

function emitLangChange() {
  storeListeners.forEach((listener) => listener());
}

function subscribeLang(listener: () => void) {
  storeListeners.push(listener);
  window.addEventListener("storage", listener);
  return () => {
    storeListeners = storeListeners.filter((l) => l !== listener);
    window.removeEventListener("storage", listener);
  };
}

function getLangSnapshot(): Lang {
  return window.localStorage.getItem(STORAGE_KEY) === "es" ? "es" : "en";
}

function getServerLangSnapshot(): Lang {
  return "en";
}

function writeLang(next: Lang) {
  window.localStorage.setItem(STORAGE_KEY, next);
  emitLangChange();
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribeLang, getLangSnapshot, getServerLangSnapshot);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<LanguageContextValue>(() => {
    const setLang = (next: Lang) => writeLang(next);
    const toggleLang = () => writeLang(lang === "en" ? "es" : "en");
    const t = (b: Bilingual) => b[lang];
    return { lang, setLang, toggleLang, t, ui: UI[lang] };
  }, [lang]);

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
