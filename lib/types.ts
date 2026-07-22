export type Lang = "en" | "es";

export interface Bilingual {
  en: string;
  es: string;
}

export type StageType = "adult" | "college" | "university" | "career";

export type Field =
  | "healthcare"
  | "business"
  | "construction"
  | "culinary"
  | "technology"
  | "publicServices"
  | "transportation";

export type ProgramCategory =
  | "business"
  | "construction"
  | "culinary"
  | "esl"
  | "healthcareDirect"
  | "healthcareAllied"
  | "hsd"
  | "technology"
  | "publicServices"
  | "salesAndMarketing"
  | "transportation"
  | "skillsSupport";

export type SchoolType = "adult" | "college" | "university";

export interface School {
  id: string;
  name: string;
  type: SchoolType;
  city: string;
  phone: string;
  address: string;
  mapUrl: string;
  enrollmentUrl: string;
  icon: string;
  logoUrl?: string;
}

export interface Program {
  id: string;
  schoolId: string;
  title: Bilingual;
  description: Bilingual;
  duration: Bilingual;
  cost: Bilingual;
  schedule: Bilingual;
  credential: Bilingual | null;
  icon: string;
  category: ProgramCategory;
  realProgramName: string;
}

export type Demand = "high" | "medium" | "growing";

export interface Career {
  id: string;
  title: Bilingual;
  field: Field;
  wageHourly: number;
  wageAnnual: number;
  demand: Demand;
  icon: string;
  socNote: string;
}

export interface PathwayStep {
  stageType: StageType;
  refId?: string;
  title: Bilingual;
  subtitle: Bilingual;
  tags: Bilingual[];
  icon: string;
}

export interface NextStepAction {
  schoolId: string;
  note: Bilingual;
}

export interface StudentStory {
  name: string;
  quote: Bilingual;
}

export type TimeCommitment = "short" | "medium" | "long";
export type Goal = "earn-soon" | "balanced" | "degree";

export interface Pathway {
  id: string;
  title: Bilingual;
  tagline: Bilingual;
  field: Field;
  timeCommitment: TimeCommitment;
  goal: Goal;
  steps: PathwayStep[];
  nextStep: NextStepAction;
  careerIds: string[];
  schoolIds: string[];
  story?: StudentStory;
}
