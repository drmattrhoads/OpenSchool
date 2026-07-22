"use client";

import Link from "next/link";
import { Compass, MapPin, Sparkles, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { PATHWAYS, FIELD_META, ALL_FIELDS } from "@/lib/data";
import { ICONS, DEFAULT_ICON } from "@/lib/icons";
import { StoryCard } from "@/components/StoryCard";

export default function Home() {
  const { t, ui } = useLanguage();
  const stories = PATHWAYS.filter((p) => p.story);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-12 px-4 py-8 sm:py-12">
      <section className="flex flex-col gap-2 text-center sm:text-left">
        <h1 className="font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
          {ui.tagline}
        </h1>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/careers"
          className="group flex flex-col gap-3 rounded-3xl border-2 border-amber bg-amber-soft p-6 transition-transform hover:-translate-y-1"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-paper-raised text-amber-ink shadow-sm">
            <Compass size={28} />
          </span>
          <span className="font-display text-2xl font-extrabold leading-snug text-amber-ink">
            {ui.doorGoal}
          </span>
          <span className="text-sm text-ink-soft">{ui.doorGoalSub}</span>
          <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-amber-ink">
            {ui.careers} <ArrowRight size={16} />
          </span>
        </Link>

        <Link
          href="/explore"
          className="group flex flex-col gap-3 rounded-3xl border-2 border-accent bg-accent-soft p-6 transition-transform hover:-translate-y-1"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-paper-raised text-accent-ink shadow-sm">
            <MapPin size={28} />
          </span>
          <span className="font-display text-2xl font-extrabold leading-snug text-accent-ink">
            {ui.doorNow}
          </span>
          <span className="text-sm text-ink-soft">{ui.doorNowSub}</span>
          <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-accent-ink">
            {ui.explore} <ArrowRight size={16} />
          </span>
        </Link>
      </section>

      <section>
        <Link
          href="/wizard"
          className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-paper-raised px-5 py-4 transition-colors hover:border-plum"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-plum-soft text-plum-ink">
              <Sparkles size={18} />
            </span>
            <span className="font-display text-base font-bold text-ink sm:text-lg">
              {ui.doorWizard}
            </span>
          </span>
          <ArrowRight size={18} className="shrink-0 text-plum-ink" />
        </Link>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold text-ink">{ui.storiesHeading}</h2>
          <Link href="/pathways" className="text-sm font-semibold text-accent-ink hover:underline">
            {ui.browseAllPathways}
          </Link>
        </div>
        <p className="mt-1 text-sm text-ink-soft">{ui.storiesSub}</p>
        <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
          {stories.map((pathway) => (
            <StoryCard key={pathway.id} pathway={pathway} t={t} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold text-ink">{ui.fieldsHeading}</h2>
          <Link href="/careers" className="text-sm font-semibold text-accent-ink hover:underline">
            {ui.careersAll}
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {ALL_FIELDS.map((field) => {
            const meta = FIELD_META[field];
            const Icon = (ICONS[meta.icon] ?? DEFAULT_ICON);
            return (
              <Link
                key={field}
                href={`/careers#field-${field}`}
                className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-paper-raised p-4 text-center transition-all hover:-translate-y-0.5 hover:border-amber hover:shadow-sm"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-soft text-amber-ink">
                  <Icon size={20} />
                </span>
                <span className="text-sm font-bold leading-tight text-ink">{t(meta.label)}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
