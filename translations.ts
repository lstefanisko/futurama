import { Category, Language } from './types';

const baseEn = {
  title: "FUTUREFORECAST",
  explorer: "Future Lab",
  pricing: "Tiers",
  vault: "Neural Vault",
  settings: "Parameters",
  timeline: "Target Year",
  sector: "Sector",
  intensity: "Neural Intensity",
  generate: "INVOKE ORACLE",
  globalImpact: "Regional Matrix",
  impactLegend: "Load Map",
  probabilityLabel: "Neural Fidelity",
  analysisLabel: "Core Logic",
  sourcesTitle: "Grounding Sources",
  loading: "Accessing Future Node...",
  readyTitle: "NEURO-ORACLE",
  readyDesc: "Extracting temporal possibilities with algorithmic precision.",
  slogan: "AI PREDICTIONS WITH PRECISION UP TO THE YEAR 2100",
  visionStreamTitle: "LIVE TEMPORAL STREAM",
  visionStreamDesc: "Real-time visual data nodes from high-probability future branches.",
  shareVision: "Broadcast",
  downloadImg: "Export",
  saveVault: "Commit to Vault",
  visualize: "AI Vision",
  proOnly: "Restricted",
  yearLimit: "Deep timeline access (2100) requires Visionary PRO clearance.",
  tasksTitle: "Neural Roadmap",
  addTaskPlaceholder: "Define objective...",
  noTasks: "Awaiting system objectives.",
  vaultEmpty: "Vault is empty.",
  plans: "Access Tiers",
  choosePlan: "Initialize",
  payNow: "Unlock Access",
  perMonth: "/mo",
  usageGuide: "Operational Manual",
  categories: {
    [Category.TECHNOLOGY]: "SINGULARITY",
    [Category.SOCIETY]: "META-SOCIETY",
    [Category.ENVIRONMENT]: "ECO-CORE",
    [Category.HEALTH]: "BIO-GENETICS",
    [Category.SPACE]: "GALACTIC AXIS",
  },
  planDetails: {
    guest: {
      desc: "Basic exploration of the immediate future.",
      usage: "Use the slider up to 2045. View text-based trends and public archives. Ideal for casual observation."
    },
    pro: {
      desc: "Full temporal resolution and synthesis.",
      usage: "Unlock the 2100 axis. Use 'Visualize' for AI images, 'Play' for Neural TTS, and 'Invoke' for Deep Temporal Analysis."
    },
    oracle: {
      desc: "Maximum fidelity for enterprise and research.",
      usage: "Priority access to Gemini 3 Pro models. API node connectivity for external systems. Unlimited visual synthesis."
    }
  }
};

const sk = {
  ...baseEn,
  title: "FUTUREFORECAST",
  explorer: "Laboratórium",
  pricing: "Prístup",
  vault: "Archív Vízií",
  settings: "Parametre",
  timeline: "Cieľový Rok",
  sector: "Sektor",
  intensity: "Intenzita",
  generate: "ZVOLAŤ ORÁKULUM",
  globalImpact: "Regionálna Matrica",
  impactLegend: "Záťaž",
  probabilityLabel: "Fidelita",
  analysisLabel: "Analýza",
  sourcesTitle: "Zdroje",
  loading: "Syntéza Uzlov...",
  readyTitle: "NEURO-ORÁKULUM",
  readyDesc: "Extrakcia časových možností s presnosťou algoritmu.",
  slogan: "AI PREDPOVEDE S PRECÍZNOSŤOU AŽ DO ROKU 2100",
  visionStreamTitle: "ŽIVÝ PRÚD ČASU",
  visionStreamDesc: "Vizuálne dátové uzly z vysoko pravdepodobných vetiev budúcnosti.",
  shareVision: "Zdieľať",
  downloadImg: "Exportovať",
  saveVault: "Uložiť do Archívu",
  visualize: "AI Vizualizácia",
  proOnly: "Obmedzené",
  yearLimit: "Prístup k osi 2100 vyžaduje Visionary PRO autorizáciu.",
  tasksTitle: "Cestovná Mapa",
  addTaskPlaceholder: "Definovať cieľ...",
  noTasks: "Systém čaká na ciele.",
  vaultEmpty: "Archív je prázdny.",
  plans: "Úrovne Prístupu",
  choosePlan: "Aktivovať",
  payNow: "Odomknúť Orákulum",
  perMonth: "/mes",
  usageGuide: "Operačný Manuál",
  categories: {
    [Category.TECHNOLOGY]: "SINGULARITA",
    [Category.SOCIETY]: "SPOLOČNOSŤ",
    [Category.ENVIRONMENT]: "PROSTREDIE",
    [Category.HEALTH]: "BIO-GENETIKA",
    [Category.SPACE]: "VESMÍR",
  },
  planDetails: {
    guest: {
      desc: "Základný prieskum blízkej budúcnosti.",
      usage: "Použite slider do roku 2045. Sledujte textové trendy a verejný archív. Ideálne pre občasných pozorovateľov."
    },
    pro: {
      desc: "Plné časové rozlíšenie a syntéza dát.",
      usage: "Odomknite os 2100. Použite 'Vizualizovať' pre AI obrazy, 'Prehrať' pre audio a 'Vyvolať' pre hĺbkovú analýzu."
    },
    oracle: {
      desc: "Maximálna presnosť pre firmy a výskum.",
      usage: "Prioritný prístup k modelom Gemini 3 Pro. API prepojenia pre externé systémy. Neobmedzená vizuálna syntéza."
    }
  }
};

const de = { ...baseEn, title: "ZUKUNFTSPROGNOSE", explorer: "Zukunftslabor", pricing: "Tarife", perMonth: "/monat", usageGuide: "Handbuch" };
const pl = { ...baseEn, title: "PROGNOZA PRZYSZŁOŚCI", explorer: "Laboratorium", pricing: "Ceny", perMonth: "/mies", usageGuide: "Instrukcja" };
const es = { ...baseEn, title: "PRONÓSTICO FUTURO", explorer: "Lab Futuro", pricing: "Planes", perMonth: "/mes", usageGuide: "Manual" };
const fr = { ...baseEn, title: "PRÉVISIONS FUTURES", explorer: "Lab Futur", pricing: "Tarifs", perMonth: "/mois", usageGuide: "Manuel" };
const it = { ...baseEn, title: "PREVISIONI FUTURE", explorer: "Lab Futuro", pricing: "Piani", perMonth: "/mese", usageGuide: "Manuale" };
const ja = { ...baseEn, title: "未来予測", explorer: "ラボ", pricing: "料金", perMonth: "/月", usageGuide: "操作ガイド" };
const pt = { ...baseEn, title: "PREVISÃO FUTURA", explorer: "Laboratório", pricing: "Planos", perMonth: "/mês", usageGuide: "Manual" };
const zh = { ...baseEn, title: "未来预测", explorer: "实验室", pricing: "方案", perMonth: "/月", usageGuide: "操作指南" };

export const translations: Record<Language, any> = {
  en: baseEn, sk, de, pl, es, fr, it, ja, pt, zh
};