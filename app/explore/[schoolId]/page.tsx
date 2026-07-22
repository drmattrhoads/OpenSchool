"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, ExternalLink } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import {
  getSchool,
  getProgramsForSchool,
  PROGRAM_CATEGORY_ORDER,
  PROGRAM_CATEGORY_META,
} from "@/lib/data";
import { ICONS, DEFAULT_ICON } from "@/lib/icons";
import { ProgramRow } from "@/components/ProgramRow";

export default function SchoolDetailPage({
  params,
}: {
  params: Promise<{ schoolId: string }>;
}) {
  const { schoolId } = use(params);
  const { t, ui } = useLanguage();
  const school = getSchool(schoolId);

  if (!school) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-ink-soft">{ui.notFound}</p>
        <Link href="/explore" className="mt-4 inline-block font-semibold text-accent-ink">
          {ui.explore}
        </Link>
      </div>
    );
  }

  const Icon = (ICONS[school.icon] ?? DEFAULT_ICON);
  const programs = getProgramsForSchool(school.id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 sm:py-12">
      <Link href="/explore" className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-accent-ink">
        <ArrowLeft size={16} />
        {ui.back}
      </Link>

      <div className="flex flex-col gap-3 rounded-3xl border-2 border-accent bg-accent-soft p-6">
        {school.logoUrl ? (
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-white p-2 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={school.logoUrl} alt="" className="h-full w-full object-contain" />
          </span>
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-paper-raised text-accent-ink shadow-sm">
            <Icon size={26} />
          </span>
        )}
        <h1 className="font-display text-2xl font-extrabold leading-snug text-accent-ink sm:text-3xl">
          {school.name}
        </h1>
        <div className="flex flex-col gap-1.5 text-sm text-ink">
          <span className="flex items-center gap-1.5">
            <MapPin size={14} />
            {school.address}
          </span>
          <span className="flex items-center gap-1.5">
            <Phone size={14} />
            {school.phone}
          </span>
        </div>
        <a
          href={school.enrollmentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <ExternalLink size={15} />
          {ui.enroll}
        </a>
      </div>

      <section className="flex flex-col gap-8">
        <h2 className="font-display text-xl font-extrabold text-ink">
          {ui.programsAt} {school.name}
        </h2>
        {PROGRAM_CATEGORY_ORDER.map((category) => {
          const inCategory = programs.filter((p) => p.category === category);
          if (inCategory.length === 0) return null;
          const meta = PROGRAM_CATEGORY_META[category];
          const CategoryIcon = ICONS[meta.icon] ?? DEFAULT_ICON;
          return (
            <div key={category}>
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent-ink">
                  <CategoryIcon size={16} />
                </span>
                <h3 className="font-display text-base font-bold text-ink">{t(meta.label)}</h3>
              </div>
              <div className="mt-3 flex flex-col gap-3">
                {inCategory.map((program) => (
                  <ProgramRow key={program.id} program={program} t={t} />
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
