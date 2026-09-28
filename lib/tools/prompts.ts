import "server-only";
import type { Quiz, ToolValues } from "./catalog";

// Prompts are written for small local models (roughly 4B–32B): one job per
// prompt, an explicit output skeleton, and hard "do not" rules. Larger
// models follow them fine; smaller ones drift without them.

export interface BuiltPrompt {
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
}

const BASE_SYSTEM = `You are OpenSchool, a planning assistant for experienced teachers.
Write classroom-ready material a teacher can use today.

Rules:
- Output GitHub-flavored Markdown only. Start directly with the content — no greeting, no "Sure", no closing offer to help.
- Match vocabulary, sentence length, and examples to the grade level given.
- Never invent standard codes. If the teacher gives standards, use them exactly; otherwise describe the skill in plain words.
- Never invent facts about specific students, statistics, or citations.
- Keep it practical and concise. Prefer bullets and short paragraphs.`;

function languageRule(language: string | undefined): string {
  if (!language || language === "English") return "Write in English.";
  if (language === "Spanish") return "Write entirely in Spanish (neutral Latin American Spanish).";
  return "Write it in English first, then a full Spanish version under a heading \"Español\".";
}

function optional(label: string, value: string | undefined): string {
  return value ? `\n${label}: ${value}` : "";
}

type MarkdownBuilder = (v: ToolValues) => BuiltPrompt;

const MARKDOWN_BUILDERS: Record<string, MarkdownBuilder> = {
  "lesson-plan": (v) => ({
    system: BASE_SYSTEM,
    user: `Write a ${v.duration} lesson plan.

Topic: ${v.topic}
Grade level: ${v.grade}${optional("Standards", v.standards)}${optional("Teacher context", v.context)}

Use exactly these sections as level-2 headings:
## Objective
One or two "Students will be able to…" statements.
## Success Criteria
2–4 "I can…" statements.
## Materials
## Lesson Sequence
A table with columns: Time | Phase | Teacher Does | Students Do. Phases: Warm-up, Direct Instruction, Guided Practice, Independent Practice, Closure. Times must add up to ${v.duration}.
## Checks for Understanding
At least three specific questions or quick checks, placed in the sequence.
## Differentiation
Bullets for: Multilingual learners, Students who need more support, Students ready for extension.
## Exit Ticket
One question that directly measures the objective.`,
    maxTokens: 3000,
  }),

  "unit-plan": (v) => ({
    system: BASE_SYSTEM,
    user: `Write a ${v.length} unit plan.

Unit topic: ${v.topic}
Grade level: ${v.grade}${optional("Standards", v.standards)}

Use exactly these sections as level-2 headings:
## Unit Overview
Two or three sentences.
## Essential Questions
2–3 open-ended questions.
## Learning Targets
4–6 "I can…" statements.
## Lesson Sequence
A table with columns: Week/Day | Focus | Key Activity | Formative Check. One row per lesson across ${v.length}.
## Summative Assessment
Describe the task and what it measures.
## Key Vocabulary
A bulleted list with student-friendly definitions.`,
    maxTokens: 3500,
  }),

  rubric: (v) => ({
    system: BASE_SYSTEM,
    user: `Create an analytic rubric.

Assignment: ${v.assignment}
Grade level: ${v.grade}
Performance levels: ${v.scale}${optional("Criteria to include", v.criteria)}

Output:
1. A one-line title as a level-2 heading.
2. ONE Markdown table. First column is "Criteria"; the remaining columns are the performance levels from highest to lowest, each with a short label and point value (e.g. "Exceeds (4)"). Use 4–6 criteria rows.
3. Every cell describes observable evidence in student-friendly language. Do not write "the student demonstrates" in every cell.
4. After the table, a short "Student checklist" of "I can…" statements, one per criterion.`,
    temperature: 0.4,
    maxTokens: 2500,
  }),

  "exit-ticket": (v) => ({
    system: BASE_SYSTEM,
    user: `Write an exit ticket.

Lesson content: ${v.topic}
Grade level: ${v.grade}

Output exactly:
## Exit Ticket
1. A recall question.
2. An application question.
3. A reflection question ("What is one thing you're still wondering about…").

## Answer Guide
For questions 1 and 2: what a correct answer looks like and the most likely misconception to watch for.`,
    temperature: 0.5,
    maxTokens: 1200,
  }),

  "text-leveler": (v) => ({
    system: BASE_SYSTEM,
    user: `Rewrite the text below for a ${v.grade} reading level.

- Keep every key idea and fact. Do not add new facts.
- Keep important content vocabulary, and explain it in context the first time it appears.
- Adjust sentence length and structure for the reading level.
- ${languageRule(v.language)}

Output:
## Leveled Text
The rewritten text.
## Key Vocabulary
3–6 words with student-friendly definitions.

Text:
"""
${v.text}
"""`,
    temperature: 0.4,
    maxTokens: 4000,
  }),

  scaffolds: (v) => ({
    system: BASE_SYSTEM,
    user: `Create differentiation supports for this task.

Task: ${v.task}
Grade level: ${v.grade}${optional("Learner needs", v.needs)}

Use these sections as level-2 headings:
## Multilingual Learners
Sentence frames, word bank, and visual or language supports.
## Students Who Need More Support
Chunked steps, a worked example or model, and accommodations.
## Students Ready for Extension
A deeper version of the same task — not more work, harder thinking.
## Quick Implementation Tips
2–3 bullets on running all three at once.`,
    maxTokens: 3000,
  }),

  "writing-feedback": (v) => ({
    system: `${BASE_SYSTEM}
- Address the student directly ("you"), warmly and honestly. Quote their own words when pointing to something specific.`,
    user: `Give feedback on this ${v.grade} student's writing. Focus: ${v.focus}.${optional("Assignment prompt / rubric", v.prompt)}
${languageRule(v.language)}

Output exactly:
## Glows
Two specific strengths, each quoting the student's words.
## Grows
Two specific, actionable next steps. For each, show a short before/after example using their writing.
## Next Step
One sentence: the single most important thing to revise first.

Student writing:
"""
${v.writing}
"""`,
    temperature: 0.4,
    maxTokens: 2000,
  }),

  "report-comments": (v) => ({
    system: BASE_SYSTEM,
    user: `Write three report card comment options for a ${v.grade} student${v.subject ? ` in ${v.subject}` : ""}.
${languageRule(v.language)}

Teacher notes: ${v.notes}

Each comment is 2–4 sentences: start with a genuine strength, name one specific area to grow, end with an encouraging next step. Use only what's in the notes. Use "[Student]" where the name goes.

Output as:
### Option 1
### Option 2
### Option 3`,
    temperature: 0.7,
    maxTokens: 1200,
  }),

  "family-email": (v) => ({
    system: BASE_SYSTEM,
    user: `Write an email from a teacher to families.

Tone: ${v.tone}
${languageRule(v.language)}
What it needs to say: ${v.points}

Output:
**Subject:** a short subject line

Then the email body. Plain, jargon-free language at about a 6th-grade reading level. Put any dates or deadlines in bold. Under 200 words per language. Sign off as "[Teacher Name]".`,
    temperature: 0.6,
    maxTokens: 1500,
  }),
};

export function buildMarkdownPrompt(toolId: string, values: ToolValues): BuiltPrompt | null {
  const builder = MARKDOWN_BUILDERS[toolId];
  return builder ? builder(values) : null;
}

// --- Quiz (structured JSON) ---

export const QUIZ_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          choices: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
          answerIndex: { type: "integer", minimum: 0, maximum: 3 },
          explanation: { type: "string" },
        },
        required: ["question", "choices", "answerIndex", "explanation"],
        additionalProperties: false,
      },
    },
  },
  required: ["title", "questions"],
  additionalProperties: false,
};

export function buildQuizPrompt(v: ToolValues): BuiltPrompt {
  const count = Number(v.count) || 5;
  return {
    system: `You write accurate multiple-choice quizzes for teachers. Reply with a single JSON object and nothing else.`,
    user: `Write a ${count}-question multiple-choice quiz.

Topic: ${v.topic}
Grade level: ${v.grade}
Rigor: ${v.rigor}
${v.source ? `Base every question ONLY on this source text:\n"""\n${v.source}\n"""\n` : ""}
Rules:
- Exactly ${count} questions, each with exactly 4 choices.
- Exactly one correct choice. "answerIndex" is its 0-based position (0–3). Vary the position of the correct answer across questions.
- Wrong choices must be plausible, based on real misconceptions. No "all of the above" or "none of the above".
- "explanation" is one sentence on why the answer is correct.

JSON shape:
{"title": string, "questions": [{"question": string, "choices": [string, string, string, string], "answerIndex": number, "explanation": string}]}`,
    temperature: 0.3,
    maxTokens: 400 + count * 250,
  };
}

export function validateQuiz(value: unknown, expectedCount: number): Quiz {
  const obj = value as Partial<Quiz> | null;
  if (!obj || typeof obj !== "object") throw new Error("not an object");
  if (!Array.isArray(obj.questions) || obj.questions.length === 0) throw new Error("no questions");
  const questions = obj.questions.map((q, i) => {
    if (typeof q?.question !== "string" || !q.question.trim()) throw new Error(`question ${i + 1} is empty`);
    if (!Array.isArray(q.choices) || q.choices.length !== 4 || q.choices.some((c) => typeof c !== "string")) {
      throw new Error(`question ${i + 1} needs exactly 4 text choices`);
    }
    const answerIndex = Number(q.answerIndex);
    if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3) {
      throw new Error(`question ${i + 1} has an invalid answerIndex`);
    }
    return {
      question: q.question.trim(),
      choices: q.choices.map((c) => c.trim()),
      answerIndex,
      explanation: typeof q.explanation === "string" ? q.explanation.trim() : "",
    };
  });
  if (questions.length < expectedCount) {
    throw new Error(`expected ${expectedCount} questions, got ${questions.length}`);
  }
  return {
    title: typeof obj.title === "string" && obj.title.trim() ? obj.title.trim() : "Quiz",
    questions: questions.slice(0, expectedCount),
  };
}
