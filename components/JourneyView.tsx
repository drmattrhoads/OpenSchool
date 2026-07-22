"use client";

import Link from "next/link";
import { Phone, MapPin, ExternalLink, Printer, ArrowRight } from "lucide-react";
import type { Pathway } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";
import { ICONS, DEFAULT_ICON } from "@/lib/icons";
import { getSchool } from "@/lib/data";
import { stageStyle } from "@/lib/stageStyles";
import { Chip } from "./Chip";
import { SpeakButton } from "./SpeakButton";

export function JourneyView({ pathway }: { pathway: Pathway }) {
  const { t, ui } = useLanguage();
  const firstCareerIndex = pathway.steps.findIndex((s) => s.stageType === "career");
  const school = getSchool(pathway.nextStep.schoolId);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col">
        {pathway.steps.map((step, i) => {
          const isLast = i === pathway.steps.length - 1;
          const style = stageStyle(step.stageType);
          const Icon = (ICONS[step.icon] ?? DEFAULT_ICON);
          const label =
            i === 0
              ? ui.youAreHere
              : firstCareerIndex >= 0 && i > firstCareerIndex
                ? ui.laterLabel
                : `${ui.stepLabel} ${i + 1}`;

          return (
            <div key={`${step.refId ?? step.title.en}-${i}`} className="flex gap-3.5 sm:gap-4">
              <div className="flex w-11 shrink-0 flex-col items-center">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 ${style.dotBg} ${style.dotBorder}`}
                >
                  <Icon size={20} className={style.tagText} />
                </span>
                {!isLast && <span className="my-0.5 w-[3px] flex-1 rounded-full bg-line" />}
              </div>
              <div className={`min-w-0 flex-1 ${isLast ? "pb-0" : "pb-7"}`}>
                <p className={`text-xs font-bold uppercase tracking-wide ${style.tagText}`}>
                  {label}
                </p>
                <div className="mt-1 flex items-start justify-between gap-2">
                  <h3 className="font-display text-lg font-bold leading-snug text-ink">
                    {t(step.title)}
                  </h3>
                  <SpeakButton text={`${t(step.title)}. ${t(step.subtitle)}`} />
                </div>
                <p className="mt-0.5 text-sm text-ink-soft">{t(step.subtitle)}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {step.tags.map((tag) => (
                    <Chip key={tag.en}>{t(tag)}</Chip>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border-2 border-accent bg-accent-soft p-5">
        <p className="font-display text-lg font-extrabold text-accent-ink">
          {ui.nextStepHeading}
        </p>
        {school && (
          <>
            <p className="mt-1 text-sm font-semibold text-ink">{school.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink">{t(pathway.nextStep.note)}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={`tel:${school.phone.replace(/[^\d+]/g, "")}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                <Phone size={15} />
                {ui.call}
              </a>
              <a
                href={school.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-accent bg-paper-raised px-4 py-2 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-soft"
              >
                <MapPin size={15} />
                {ui.getDirections}
              </a>
              <a
                href={school.enrollmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-accent bg-paper-raised px-4 py-2 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-soft"
              >
                <ExternalLink size={15} />
                {ui.enroll}
              </a>
            </div>
          </>
        )}
      </div>

      {pathway.story && (
        <div className="rounded-2xl border border-line bg-paper-raised p-5">
          <p className="text-sm leading-relaxed text-ink-soft">
            &ldquo;{t(pathway.story.quote)}&rdquo;
          </p>
          <p className="mt-2 text-sm font-bold text-ink">— {pathway.story.name}</p>
        </div>
      )}

      <Link
        href={`/pathway/${pathway.id}/print`}
        className="no-print inline-flex w-fit items-center gap-2 self-center rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:border-accent hover:text-accent-ink"
      >
        <Printer size={15} />
        {ui.print}
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}
