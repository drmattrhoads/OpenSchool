// Client-safe tool definitions: metadata and form fields only. The prompts
// that turn these fields into model requests live in lib/tools/prompts.ts,
// which is server-only.

export type ToolCategory = "planning" | "assessment" | "differentiation" | "feedback" | "communication";

export type FieldType = "text" | "textarea" | "select";

export interface ToolField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  help?: string;
  options?: string[];
  defaultValue?: string;
  maxLength?: number;
}

export interface ToolDef {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string;
  /** "markdown" streams prose; "quiz" returns validated JSON. */
  output: "markdown" | "quiz";
  fields: ToolField[];
  /** Shown above the form, e.g. privacy reminders. */
  note?: string;
}

export const CATEGORY_META: Record<ToolCategory, { label: string; order: number }> = {
  planning: { label: "Planning", order: 0 },
  assessment: { label: "Assessment", order: 1 },
  differentiation: { label: "Differentiation", order: 2 },
  feedback: { label: "Feedback", order: 3 },
  communication: { label: "Communication", order: 4 },
};

export const GRADE_LEVELS = [
  "Kindergarten",
  "1st grade",
  "2nd grade",
  "3rd grade",
  "4th grade",
  "5th grade",
  "6th grade",
  "7th grade",
  "8th grade",
  "9th grade",
  "10th grade",
  "11th grade",
  "12th grade",
  "College / university",
  "Adult education / ESL",
];

const SHORT = 500;
const LONG = 12_000;

const gradeField = (label = "Grade level"): ToolField => ({
  name: "grade",
  label,
  type: "select",
  required: true,
  options: GRADE_LEVELS,
  defaultValue: "6th grade",
});

const languageField: ToolField = {
  name: "language",
  label: "Output language",
  type: "select",
  options: ["English", "Spanish", "English and Spanish"],
  defaultValue: "English",
};

export const TOOLS: ToolDef[] = [
  {
    id: "lesson-plan",
    name: "Lesson Plan",
    description: "A complete, standards-aligned lesson with objectives, checks for understanding, and differentiation.",
    category: "planning",
    icon: "notebook",
    output: "markdown",
    fields: [
      { name: "topic", label: "Topic or learning goal", type: "text", required: true, maxLength: SHORT, placeholder: "e.g. Photosynthesis inputs and outputs" },
      gradeField(),
      { name: "duration", label: "Lesson length", type: "select", options: ["30 minutes", "45 minutes", "60 minutes", "90 minutes (block)"], defaultValue: "45 minutes" },
      { name: "standards", label: "Standards (optional)", type: "text", maxLength: SHORT, placeholder: "e.g. NGSS MS-LS1-6" },
      { name: "context", label: "Anything else? (optional)", type: "textarea", maxLength: 2_000, placeholder: "Class context, materials you have, what came before this lesson…" },
    ],
  },
  {
    id: "unit-plan",
    name: "Unit Plan",
    description: "A multi-week unit outline with essential questions, a lesson sequence, and a summative assessment.",
    category: "planning",
    icon: "calendar",
    output: "markdown",
    fields: [
      { name: "topic", label: "Unit topic", type: "text", required: true, maxLength: SHORT, placeholder: "e.g. The American Revolution" },
      gradeField(),
      { name: "length", label: "Unit length", type: "select", options: ["1 week", "2 weeks", "3 weeks", "4 weeks", "6 weeks"], defaultValue: "3 weeks" },
      { name: "standards", label: "Standards (optional)", type: "text", maxLength: SHORT },
    ],
  },
  {
    id: "quiz",
    name: "Multiple-Choice Quiz",
    description: "Quiz questions with an answer key and explanations, from a topic or a text you paste in.",
    category: "assessment",
    icon: "list-checks",
    output: "quiz",
    fields: [
      { name: "topic", label: "Topic", type: "text", required: true, maxLength: SHORT, placeholder: "e.g. Fractions: adding unlike denominators" },
      gradeField(),
      { name: "count", label: "Number of questions", type: "select", options: ["5", "8", "10", "15"], defaultValue: "5" },
      { name: "rigor", label: "Rigor", type: "select", options: ["Mostly recall (DOK 1)", "Mixed (DOK 1–3)", "Mostly reasoning (DOK 2–3)"], defaultValue: "Mixed (DOK 1–3)" },
      { name: "source", label: "Source text (optional)", type: "textarea", maxLength: LONG, help: "Paste a passage to base every question on it.", placeholder: "Paste a reading passage, article, or notes…" },
    ],
  },
  {
    id: "rubric",
    name: "Rubric",
    description: "An analytic rubric table with clear, observable criteria for any assignment.",
    category: "assessment",
    icon: "table",
    output: "markdown",
    fields: [
      { name: "assignment", label: "Assignment description", type: "textarea", required: true, maxLength: 3_000, placeholder: "e.g. Argumentative essay on whether schools should have later start times" },
      gradeField(),
      { name: "scale", label: "Performance levels", type: "select", options: ["3 levels", "4 levels", "5 levels"], defaultValue: "4 levels" },
      { name: "criteria", label: "Criteria to include (optional)", type: "text", maxLength: SHORT, placeholder: "e.g. claim, evidence, reasoning, conventions" },
    ],
  },
  {
    id: "exit-ticket",
    name: "Exit Ticket",
    description: "Three quick end-of-lesson questions that show who got it and who needs reteaching.",
    category: "assessment",
    icon: "ticket",
    output: "markdown",
    fields: [
      { name: "topic", label: "What did today's lesson teach?", type: "text", required: true, maxLength: SHORT },
      gradeField(),
    ],
  },
  {
    id: "text-leveler",
    name: "Text Leveler",
    description: "Rewrite any text at a different reading level while keeping the key ideas and vocabulary.",
    category: "differentiation",
    icon: "gauge",
    output: "markdown",
    fields: [
      { name: "text", label: "Original text", type: "textarea", required: true, maxLength: LONG, placeholder: "Paste the passage to rewrite…" },
      gradeField("Target reading level"),
      languageField,
    ],
  },
  {
    id: "scaffolds",
    name: "Differentiation Supports",
    description: "Scaffolds for multilingual learners, students with IEPs/504s, and students ready for extension.",
    category: "differentiation",
    icon: "layers",
    output: "markdown",
    note: "Describe needs in general terms. Don't include student names or identifying details.",
    fields: [
      { name: "task", label: "The task or lesson", type: "textarea", required: true, maxLength: 4_000, placeholder: "What are students being asked to do?" },
      gradeField(),
      { name: "needs", label: "Learner needs", type: "textarea", maxLength: 1_000, placeholder: "e.g. 5 newcomer ELs (Spanish), 3 students reading 2 grades below, 4 students ready for extension" },
    ],
  },
  {
    id: "writing-feedback",
    name: "Writing Feedback",
    description: "Specific, actionable glow-and-grow feedback on a student's writing, tied to your criteria.",
    category: "feedback",
    icon: "message-square",
    output: "markdown",
    note: "Remove student names before pasting. Your local model keeps this on your machine, but good habits travel.",
    fields: [
      { name: "writing", label: "Student writing", type: "textarea", required: true, maxLength: LONG },
      { name: "prompt", label: "Assignment prompt or rubric", type: "textarea", maxLength: 4_000 },
      gradeField(),
      { name: "focus", label: "Feedback focus", type: "select", options: ["Overall", "Ideas and argument", "Organization", "Evidence and analysis", "Grammar and conventions"], defaultValue: "Overall" },
      languageField,
    ],
  },
  {
    id: "report-comments",
    name: "Report Card Comments",
    description: "Warm, specific report card comments from a few quick notes about a student.",
    category: "feedback",
    icon: "pen-line",
    output: "markdown",
    note: "Use a first name or initials only.",
    fields: [
      { name: "notes", label: "Notes on the student", type: "textarea", required: true, maxLength: 2_000, placeholder: "e.g. Strong reader, participates in discussion, needs to turn in homework on time, improved in math facts" },
      gradeField(),
      { name: "subject", label: "Subject (optional)", type: "text", maxLength: SHORT },
      languageField,
    ],
  },
  {
    id: "family-email",
    name: "Family Email",
    description: "A clear, warm message to families — updates, concerns, or celebrations.",
    category: "communication",
    icon: "mail",
    output: "markdown",
    fields: [
      { name: "points", label: "What do you need to say?", type: "textarea", required: true, maxLength: 3_000, placeholder: "e.g. Field trip Friday, permission slips due Wednesday, bring a lunch" },
      { name: "tone", label: "Tone", type: "select", options: ["Warm and friendly", "Professional", "Celebratory", "Concerned but supportive"], defaultValue: "Warm and friendly" },
      languageField,
    ],
  },
];

export function getTool(id: string): ToolDef | undefined {
  return TOOLS.find((tool) => tool.id === id);
}

export type ToolValues = Record<string, string>;

/** Validates submitted values against a tool's fields. Returns an error message or null. */
export function validateToolValues(tool: ToolDef, values: unknown): { values: ToolValues } | { error: string } {
  if (!values || typeof values !== "object") return { error: "Missing form values." };
  const input = values as Record<string, unknown>;
  const clean: ToolValues = {};
  for (const field of tool.fields) {
    const raw = input[field.name];
    const value = typeof raw === "string" ? raw.trim() : "";
    if (field.required && !value) return { error: `${field.label} is required.` };
    if (field.maxLength && value.length > field.maxLength) {
      return { error: `${field.label} is too long (max ${field.maxLength.toLocaleString()} characters).` };
    }
    if (value && field.options && !field.options.includes(value)) {
      return { error: `${field.label} has an invalid choice.` };
    }
    clean[field.name] = value || field.defaultValue || "";
  }
  return { values: clean };
}

export interface QuizQuestion {
  question: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
}

export interface Quiz {
  title: string;
  questions: QuizQuestion[];
}
