"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Loader2,
  Copy,
  Check,
  AlertTriangle,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import {
  SCHOOLS,
  PROGRAM_CATEGORY_META,
  PROGRAM_CATEGORY_ORDER,
  FIELD_META,
  ALL_FIELDS,
} from "@/lib/data";
import type { ProgramCategory, Field } from "@/lib/types";

interface Bilingual {
  en: string;
  es: string;
}

interface ProgramDraft {
  title: Bilingual;
  description: Bilingual;
  duration: Bilingual;
  cost: Bilingual;
  schedule: Bilingual;
  credential: Bilingual | null;
}

interface CareerSource {
  title: string;
  url: string;
}

interface CareerDraft {
  title: Bilingual;
  wageHourly: number;
  wageAnnual: number;
  demand: string;
  socNote: string;
  researchNotes: string;
  sources: CareerSource[];
}

function CopyButton({ id, text, copiedId, onCopy }: { id: string; text: string; copiedId: string | null; onCopy: (id: string, text: string) => void }) {
  const isCopied = copiedId === id;
  return (
    <button
      type="button"
      onClick={() => onCopy(id, text)}
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper-raised px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-accent hover:text-accent-ink"
    >
      {isCopied ? <Check size={13} /> : <Copy size={13} />}
      {isCopied ? "Copied" : "Copy JSON"}
    </button>
  );
}

export default function ContentAssistantPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function copyText(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1500);
  }

  // --- Program draft form ---
  const [programName, setProgramName] = useState("");
  const [schoolId, setSchoolId] = useState(SCHOOLS[0].id);
  const [category, setCategory] = useState<ProgramCategory>(PROGRAM_CATEGORY_ORDER[0]);
  const [programLoading, setProgramLoading] = useState(false);
  const [programError, setProgramError] = useState<string | null>(null);
  const [programDraft, setProgramDraft] = useState<ProgramDraft | null>(null);

  async function handleDraftProgram(e: React.FormEvent) {
    e.preventDefault();
    setProgramLoading(true);
    setProgramError(null);
    setProgramDraft(null);
    try {
      const school = SCHOOLS.find((s) => s.id === schoolId);
      const res = await fetch("/api/gemini/draft-program", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          realProgramName: programName,
          schoolName: school?.name ?? schoolId,
          categoryLabel: PROGRAM_CATEGORY_META[category].label.en,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed.");
      setProgramDraft(data.draft as ProgramDraft);
    } catch (err) {
      setProgramError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setProgramLoading(false);
    }
  }

  // --- Career draft form ---
  const [jobTitle, setJobTitle] = useState("");
  const [field, setField] = useState<Field>(ALL_FIELDS[0]);
  const [careerLoading, setCareerLoading] = useState(false);
  const [careerError, setCareerError] = useState<string | null>(null);
  const [careerDraft, setCareerDraft] = useState<CareerDraft | null>(null);

  async function handleDraftCareer(e: React.FormEvent) {
    e.preventDefault();
    setCareerLoading(true);
    setCareerError(null);
    setCareerDraft(null);
    try {
      const res = await fetch("/api/gemini/draft-career", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle,
          fieldLabel: FIELD_META[field].label.en,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed.");
      setCareerDraft(data.draft as CareerDraft);
    } catch (err) {
      setCareerError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setCareerLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-8 sm:py-12">
      <div>
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-accent-ink">
          <ArrowLeft size={16} />
          Back to app
        </Link>
        <h1 className="mt-3 font-display text-2xl font-extrabold text-ink">Content Assistant</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Staff tool. Uses Gemini to draft bilingual program and career copy in the app&apos;s
          established plain-language style. Every draft is AI-generated and unverified — review
          it, check the sources, and edit before adding anything to the real catalog.
        </p>
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-soft p-3 text-xs text-amber-ink">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" />
          <span>
            This page has no login or access control in this prototype. Do not deploy it publicly
            without adding staff authentication first.
          </span>
        </div>
      </div>

      {/* Program drafting */}
      <section className="rounded-2xl border border-line bg-paper-raised p-5">
        <h2 className="font-display text-lg font-bold text-ink">Draft a program</h2>
        <p className="mt-1 text-sm text-ink-soft">
          For adding a new real class to the catalog once a school confirms it.
        </p>
        <form onSubmit={handleDraftProgram} className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm font-semibold text-ink">
            Real program name
            <input
              type="text"
              required
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              placeholder="e.g. Phlebotomy Technician"
              className="rounded-lg border border-line bg-paper px-3 py-2 text-sm font-normal text-ink"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm font-semibold text-ink">
              School
              <select
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                className="rounded-lg border border-line bg-paper px-3 py-2 text-sm font-normal text-ink"
              >
                {SCHOOLS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold text-ink">
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProgramCategory)}
                className="rounded-lg border border-line bg-paper px-3 py-2 text-sm font-normal text-ink"
              >
                {PROGRAM_CATEGORY_ORDER.map((c) => (
                  <option key={c} value={c}>
                    {PROGRAM_CATEGORY_META[c].label.en}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            type="submit"
            disabled={programLoading || !programName.trim()}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {programLoading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            Generate with Gemini
          </button>
        </form>

        {programError && (
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-soft p-3 text-sm text-amber-ink">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            {programError}
          </p>
        )}

        {programDraft && (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-line bg-paper p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-base font-bold text-ink">{programDraft.title.en}</p>
                <p className="text-sm text-ink-soft">{programDraft.title.es}</p>
              </div>
              <CopyButton
                id="program"
                text={JSON.stringify(programDraft, null, 2)}
                copiedId={copiedId}
                onCopy={copyText}
              />
            </div>
            <p className="text-sm text-ink">{programDraft.description.en}</p>
            <p className="text-sm text-ink-soft">{programDraft.description.es}</p>
            <div className="flex flex-wrap gap-2 text-xs text-ink-soft">
              <span className="rounded-full bg-code-bg px-2.5 py-1">{programDraft.duration.en}</span>
              <span className="rounded-full bg-code-bg px-2.5 py-1">{programDraft.cost.en}</span>
              <span className="rounded-full bg-code-bg px-2.5 py-1">{programDraft.schedule.en}</span>
              {programDraft.credential && (
                <span className="rounded-full bg-code-bg px-2.5 py-1">{programDraft.credential.en}</span>
              )}
            </div>
            <p className="text-xs text-ink-faint">
              Copy this into a new entry in <code>lib/data.ts</code> — you&apos;ll still need to
              add its <code>id</code>, <code>schoolId</code>, <code>category</code>, and{" "}
              <code>icon</code>.
            </p>
          </div>
        )}
      </section>

      {/* Career drafting */}
      <section className="rounded-2xl border border-line bg-paper-raised p-5">
        <h2 className="font-display text-lg font-bold text-ink">Draft a career / local job</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Researches the role with live Google Search grounding, then drafts a bilingual career
          card. Always check the sources — wage figures still need CA EDD LMI verification before
          they go live.
        </p>
        <form onSubmit={handleDraftCareer} className="mt-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm font-semibold text-ink">
              Job title
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Dental Assistant"
                className="rounded-lg border border-line bg-paper px-3 py-2 text-sm font-normal text-ink"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold text-ink">
              Field
              <select
                value={field}
                onChange={(e) => setField(e.target.value as Field)}
                className="rounded-lg border border-line bg-paper px-3 py-2 text-sm font-normal text-ink"
              >
                {ALL_FIELDS.map((f) => (
                  <option key={f} value={f}>
                    {FIELD_META[f].label.en}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            type="submit"
            disabled={careerLoading || !jobTitle.trim()}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {careerLoading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            Research &amp; draft with Gemini
          </button>
        </form>

        {careerError && (
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-soft p-3 text-sm text-amber-ink">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            {careerError}
          </p>
        )}

        {careerDraft && (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-line bg-paper p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-base font-bold text-ink">{careerDraft.title.en}</p>
                <p className="text-sm text-ink-soft">{careerDraft.title.es}</p>
              </div>
              <CopyButton
                id="career"
                text={JSON.stringify(
                  {
                    title: careerDraft.title,
                    wageHourly: careerDraft.wageHourly,
                    wageAnnual: careerDraft.wageAnnual,
                    demand: careerDraft.demand,
                    socNote: careerDraft.socNote,
                  },
                  null,
                  2,
                )}
                copiedId={copiedId}
                onCopy={copyText}
              />
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-ink-soft">
              <span className="tabular rounded-full bg-amber-soft px-2.5 py-1 text-amber-ink">
                ${careerDraft.wageHourly}/hour
              </span>
              <span className="tabular rounded-full bg-code-bg px-2.5 py-1">
                ~${careerDraft.wageAnnual.toLocaleString("en-US")}/year
              </span>
              <span className="rounded-full bg-code-bg px-2.5 py-1">{careerDraft.demand} demand</span>
              {careerDraft.socNote && (
                <span className="rounded-full bg-code-bg px-2.5 py-1">{careerDraft.socNote}</span>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                Research notes
              </p>
              <p className="mt-1 text-sm text-ink-soft">{careerDraft.researchNotes}</p>
            </div>
            {careerDraft.sources.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  Sources — verify before publishing
                </p>
                <ul className="mt-1 flex flex-col gap-1">
                  {careerDraft.sources.map((source) => (
                    <li key={source.url}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-accent-ink hover:underline"
                      >
                        <ExternalLink size={13} />
                        {source.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-xs text-ink-faint">
              Copy this into a new entry in the <code>CAREERS</code> array in{" "}
              <code>lib/data.ts</code> — you&apos;ll still need to add its <code>id</code>,{" "}
              <code>field</code>, and <code>icon</code>.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
