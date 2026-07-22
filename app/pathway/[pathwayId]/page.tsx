"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { getPathway, FIELD_META } from "@/lib/data";
import { JourneyView } from "@/components/JourneyView";

export default function PathwayPage({
  params,
}: {
  params: Promise<{ pathwayId: string }>;
}) {
  const { pathwayId } = use(params);
  const { t, ui } = useLanguage();
  const pathway = getPathway(pathwayId);

  if (!pathway) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-ink-soft">{ui.notFound}</p>
        <Link href="/pathways" className="mt-4 inline-block font-semibold text-accent-ink">
          {ui.browseAllPathways}
        </Link>
      </div>
    );
  }

  const fieldMeta = FIELD_META[pathway.field];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8 sm:py-12">
      <Link
        href="/careers"
        className="no-print inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-accent-ink"
      >
        <ArrowLeft size={16} />
        {ui.back}
      </Link>

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-amber-ink">
          {t(fieldMeta.label)}
        </p>
        <h1 className="mt-1 font-display text-2xl font-extrabold leading-snug text-ink sm:text-3xl">
          {t(pathway.title)}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">{t(pathway.tagline)}</p>
      </div>

      <JourneyView pathway={pathway} />
    </div>
  );
}
