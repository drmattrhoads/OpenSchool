"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { getCareer, getPathwaysForCareer, FIELD_META } from "@/lib/data";
import { ICONS, DEFAULT_ICON } from "@/lib/icons";
import { Chip } from "@/components/Chip";
import { SpeakButton } from "@/components/SpeakButton";
import { PathwayLinkCard } from "@/components/PathwayLinkCard";

const DEMAND_KEY = {
  high: "demandHigh",
  medium: "demandMedium",
  growing: "demandGrowing",
} as const;

export default function CareerDetailPage({
  params,
}: {
  params: Promise<{ careerId: string }>;
}) {
  const { careerId } = use(params);
  const { t, ui } = useLanguage();
  const career = getCareer(careerId);

  if (!career) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-ink-soft">{ui.notFound}</p>
        <Link href="/careers" className="mt-4 inline-block font-semibold text-accent-ink">
          {ui.careersAll}
        </Link>
      </div>
    );
  }

  const Icon = (ICONS[career.icon] ?? DEFAULT_ICON);
  const pathways = getPathwaysForCareer(career.id);
  const fieldMeta = FIELD_META[career.field];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 sm:py-12">
      <Link href="/careers" className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-accent-ink">
        <ArrowLeft size={16} />
        {ui.back}
      </Link>

      <div className="flex flex-col gap-3 rounded-3xl border-2 border-amber bg-amber-soft p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-paper-raised text-amber-ink shadow-sm">
            <Icon size={30} />
          </span>
          <SpeakButton text={t(career.title)} />
        </div>
        <h1 className="font-display text-2xl font-extrabold leading-snug text-amber-ink sm:text-3xl">
          {t(career.title)}
        </h1>
        <p className="text-sm font-semibold text-amber-ink">{t(fieldMeta.label)}</p>
        <div className="flex flex-wrap gap-2">
          <Chip className="tabular bg-paper-raised text-base text-amber-ink">
            ${career.wageHourly}
            {ui.perHour}
          </Chip>
          <Chip className="tabular bg-paper-raised text-amber-ink">
            ~${career.wageAnnual.toLocaleString("en-US")}
            {ui.perYear}
          </Chip>
          <Chip className="bg-paper-raised text-amber-ink">{ui[DEMAND_KEY[career.demand]]}</Chip>
        </div>
      </div>

      <section>
        <h2 className="font-display text-xl font-extrabold text-ink">{ui.seePathways}</h2>
        <div className="mt-4 flex flex-col gap-3">
          {pathways.map((pathway) => (
            <PathwayLinkCard key={pathway.id} pathway={pathway} t={t} />
          ))}
        </div>
      </section>
    </div>
  );
}
