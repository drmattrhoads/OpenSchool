"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles, RotateCcw } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { ALL_FIELDS, FIELD_META, PATHWAYS } from "@/lib/data";
import { ICONS, DEFAULT_ICON } from "@/lib/icons";
import { PathwayLinkCard } from "@/components/PathwayLinkCard";
import type { Field, Goal, Pathway, TimeCommitment } from "@/lib/types";

const TIME_ORDER: TimeCommitment[] = ["short", "medium", "long"];
const GOAL_ORDER: Goal[] = ["earn-soon", "balanced", "degree"];

function proximity<T>(order: T[], a: T, b: T): number {
  const diff = Math.abs(order.indexOf(a) - order.indexOf(b));
  if (diff === 0) return 2;
  if (diff === 1) return 1;
  return 0;
}

function scorePathway(pathway: Pathway, field: Field, time: TimeCommitment, goal: Goal): number {
  const fieldScore = pathway.field === field ? 5 : 0;
  const timeScore = proximity(TIME_ORDER, pathway.timeCommitment, time);
  const goalScore = proximity(GOAL_ORDER, pathway.goal, goal);
  return fieldScore + timeScore + goalScore;
}

type Answers = { field?: Field; time?: TimeCommitment; goal?: Goal };

export default function WizardPage() {
  const { t, ui } = useLanguage();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  const results = useMemo(() => {
    if (!answers.field || !answers.time || !answers.goal) return [];
    const { field, time, goal } = answers;
    return [...PATHWAYS]
      .map((p) => ({ pathway: p, score: scorePathway(p, field, time, goal) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((r) => r.pathway);
  }, [answers]);

  const restart = () => {
    setAnswers({});
    setStep(0);
  };

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const progressLabel = (n: number) => (
    <p className="text-xs font-bold uppercase tracking-wide text-plum-ink">
      {ui.wizardStep} {n} {ui.of} 3
    </p>
  );

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8 sm:py-12">
      <div className="flex items-center justify-between">
        {step > 0 ? (
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-accent-ink"
          >
            <ArrowLeft size={16} />
            {ui.back}
          </button>
        ) : (
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-accent-ink">
            <ArrowLeft size={16} />
            {ui.home}
          </Link>
        )}
        {step > 0 && step < 4 && (
          <button
            type="button"
            onClick={restart}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-faint hover:text-ink-soft"
          >
            <RotateCcw size={13} />
            {ui.wizardRestart}
          </button>
        )}
      </div>

      {step === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-plum bg-plum-soft p-8 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-paper-raised text-plum-ink shadow-sm">
            <Sparkles size={28} />
          </span>
          <h1 className="font-display text-2xl font-extrabold text-plum-ink">{ui.wizardTitle}</h1>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-plum px-6 py-3 text-base font-bold text-white transition-opacity hover:opacity-90"
          >
            {ui.wizardStart}
            <ArrowRight size={17} />
          </button>
        </div>
      )}

      {step === 1 && (
        <section className="flex flex-col gap-4">
          {progressLabel(1)}
          <h2 className="font-display text-2xl font-extrabold text-ink">{ui.wizardQ1}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {ALL_FIELDS.map((field) => {
              const meta = FIELD_META[field];
              const Icon = (ICONS[meta.icon] ?? DEFAULT_ICON);
              return (
                <button
                  key={field}
                  type="button"
                  onClick={() => {
                    setAnswers((a) => ({ ...a, field }));
                    setStep(2);
                  }}
                  className="flex flex-col items-center gap-2 rounded-2xl border-2 border-line bg-paper-raised p-4 text-center transition-all hover:-translate-y-0.5 hover:border-plum hover:shadow-sm"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-plum-soft text-plum-ink">
                    <Icon size={22} />
                  </span>
                  <span className="text-sm font-bold leading-tight text-ink">{t(meta.label)}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="flex flex-col gap-4">
          {progressLabel(2)}
          <h2 className="font-display text-2xl font-extrabold text-ink">{ui.wizardQ2}</h2>
          <div className="flex flex-col gap-3">
            {(
              [
                ["short", ui.wizardTimeShort],
                ["medium", ui.wizardTimeMedium],
                ["long", ui.wizardTimeLong],
              ] as [TimeCommitment, string][]
            ).map(([time, label]) => (
              <button
                key={time}
                type="button"
                onClick={() => {
                  setAnswers((a) => ({ ...a, time }));
                  setStep(3);
                }}
                className="rounded-2xl border-2 border-line bg-paper-raised p-4 text-left text-base font-bold text-ink transition-all hover:border-plum hover:shadow-sm"
              >
                {label}
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="flex flex-col gap-4">
          {progressLabel(3)}
          <h2 className="font-display text-2xl font-extrabold text-ink">{ui.wizardQ3}</h2>
          <div className="flex flex-col gap-3">
            {(
              [
                ["earn-soon", ui.wizardGoalEarn],
                ["balanced", ui.wizardGoalBalanced],
                ["degree", ui.wizardGoalDegree],
              ] as [Goal, string][]
            ).map(([goal, label]) => (
              <button
                key={goal}
                type="button"
                onClick={() => {
                  setAnswers((a) => ({ ...a, goal }));
                  setStep(4);
                }}
                className="rounded-2xl border-2 border-line bg-paper-raised p-4 text-left text-base font-bold text-ink transition-all hover:border-plum hover:shadow-sm"
              >
                {label}
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-display text-2xl font-extrabold text-ink">{ui.wizardResults}</h2>
          <div className="flex flex-col gap-3">
            {results.map((pathway) => (
              <PathwayLinkCard key={pathway.id} pathway={pathway} t={t} />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={restart}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-accent-ink"
            >
              <RotateCcw size={15} />
              {ui.wizardRestart}
            </button>
            <Link href="/pathways" className="text-sm font-semibold text-accent-ink hover:underline">
              {ui.browseAllPathways}
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
