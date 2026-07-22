import { GoogleGenAI } from "@google/genai";

// Server-only: this file must never be imported from a Client Component.
// The API key lives only in GEMINI_API_KEY, read here on the server.

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Copy .env.example to .env.local and add your key from https://aistudio.google.com/apikey",
    );
  }
  return new GoogleGenAI({ apiKey });
}

export interface Bilingual {
  en: string;
  es: string;
}

export interface ProgramDraft {
  title: Bilingual;
  description: Bilingual;
  duration: Bilingual;
  cost: Bilingual;
  schedule: Bilingual;
  credential: Bilingual | null;
}

const PROGRAM_STYLE_GUIDE = `You are writing bilingual (English + Spanish) plain-language program listings for
E2C Pathways, a visual pathway-mapping app for adult education / ESL students in North San Diego
County, many of whom read at a 3rd-5th grade level.

RULES:
- description: ONE short sentence, present tense, plain words, describing what the student learns or does.
- duration: a short, realistic estimate for a noncredit adult-ed / CTE class of this type.
- cost: always exactly "Free" (English) / "Gratis" (Spanish) — these are publicly funded adult education programs.
- schedule: short and plausible (e.g. "Morning or evening", "Day classes").
- credential: a short realistic certificate/credential name awarded, or null if the class does not
  award a distinct certificate (true for general ESL/HSD-style classes — use your judgment).
- Every field must be written in BOTH English and Spanish.`;

const PROGRAM_SCHEMA = {
  type: "object",
  properties: {
    title: {
      type: "object",
      properties: { en: { type: "string" }, es: { type: "string" } },
      required: ["en", "es"],
    },
    description: {
      type: "object",
      properties: { en: { type: "string" }, es: { type: "string" } },
      required: ["en", "es"],
    },
    duration: {
      type: "object",
      properties: { en: { type: "string" }, es: { type: "string" } },
      required: ["en", "es"],
    },
    cost: {
      type: "object",
      properties: { en: { type: "string" }, es: { type: "string" } },
      required: ["en", "es"],
    },
    schedule: {
      type: "object",
      properties: { en: { type: "string" }, es: { type: "string" } },
      required: ["en", "es"],
    },
    credential: {
      anyOf: [
        {
          type: "object",
          properties: { en: { type: "string" }, es: { type: "string" } },
          required: ["en", "es"],
        },
        { type: "null" },
      ],
    },
  },
  required: ["title", "description", "duration", "cost", "schedule", "credential"],
};

export async function draftProgram(input: {
  realProgramName: string;
  schoolName: string;
  categoryLabel: string;
}): Promise<ProgramDraft> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: `${PROGRAM_STYLE_GUIDE}

Draft one program listing for:
- Real program name: "${input.realProgramName}"
- School: ${input.schoolName}
- Category: ${input.categoryLabel}

Return only the JSON object described by the schema.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: PROGRAM_SCHEMA,
    },
  });

  const text = response.text;
  if (!text) throw new Error("Gemini returned an empty response.");
  return JSON.parse(text) as ProgramDraft;
}

export interface CareerSource {
  title: string;
  url: string;
}

export interface CareerDraft {
  title: Bilingual;
  wageHourly: number;
  wageAnnual: number;
  demand: "high" | "medium" | "growing";
  socNote: string;
  researchNotes: string;
  sources: CareerSource[];
}

const CAREER_SCHEMA = {
  type: "object",
  properties: {
    title: {
      type: "object",
      properties: { en: { type: "string" }, es: { type: "string" } },
      required: ["en", "es"],
    },
    wageHourly: { type: "number" },
    wageAnnual: { type: "number" },
    demand: { type: "string", enum: ["high", "medium", "growing"] },
    socNote: { type: "string" },
  },
  required: ["title", "wageHourly", "wageAnnual", "demand", "socNote"],
};

/**
 * Two-step draft: first research the role with live Google Search grounding
 * (so wage/demand claims are tied to real sources, not pure model recall),
 * then reformat those findings into the app's strict bilingual schema.
 * The raw research text and source links are returned so a staff member can
 * verify the claim before it goes anywhere near real data — this tool drafts,
 * it does not publish.
 */
export async function draftCareer(input: {
  jobTitle: string;
  fieldLabel: string;
}): Promise<CareerDraft> {
  const ai = getClient();

  const research = await ai.models.generateContent({
    model: MODEL,
    contents: `Look up current, realistic entry-level wage and job-demand information for
"${input.jobTitle}" (field: ${input.fieldLabel}) specifically in San Diego County, California,
for someone entering the role after a noncredit adult-education certificate program (not a
four-year degree). Report: a typical entry-level hourly wage, a typical annual wage, and whether
demand is high / medium / growing. Keep it to a short paragraph.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const researchNotes = research.text ?? "";
  const groundingChunks = research.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  const sources: CareerSource[] = groundingChunks
    .map((chunk) => chunk.web)
    .filter((web): web is { title?: string; uri?: string } => Boolean(web?.uri))
    .map((web) => ({ title: web.title || web.uri!, url: web.uri! }));

  const structured = await ai.models.generateContent({
    model: MODEL,
    contents: `You are writing a bilingual (English + Spanish) career card for E2C Pathways, a
pathway-mapping app for adult education students in North San Diego County who often read at a
3rd-5th grade level. Use plain, short job titles.

Research notes to base your answer on:
"""
${researchNotes}
"""

Job title requested: "${input.jobTitle}"
Field: ${input.fieldLabel}

Return only the JSON object described by the schema. wageHourly and wageAnnual must be plain
numbers (no dollar signs or commas). socNote should be a short SOC code reference if you can
infer a plausible one (e.g. "SOC 31-1131"), otherwise an empty string.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: CAREER_SCHEMA,
    },
  });

  const text = structured.text;
  if (!text) throw new Error("Gemini returned an empty response.");
  const parsed = JSON.parse(text) as Omit<CareerDraft, "researchNotes" | "sources">;

  return { ...parsed, researchNotes, sources };
}
