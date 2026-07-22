import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import type { Bilingual, Pathway } from "@/lib/types";
import { FIELD_META } from "@/lib/data";
import { ICONS, DEFAULT_ICON } from "@/lib/icons";

export function PathwayLinkCard({
  pathway,
  t,
  extra,
}: {
  pathway: Pathway;
  t: (b: Bilingual) => string;
  extra?: ReactNode;
}) {
  const meta = FIELD_META[pathway.field];
  const Icon = ICONS[meta.icon] ?? DEFAULT_ICON;

  return (
    <Link
      href={`/pathway/${pathway.id}`}
      className="group flex items-center gap-3 rounded-2xl border border-line bg-paper-raised p-4 transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-sm"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
        <Icon size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-base font-bold leading-snug text-ink">{t(pathway.title)}</p>
        <p className="mt-0.5 text-sm text-ink-soft">{t(pathway.tagline)}</p>
        {extra}
      </div>
      <ArrowRight size={18} className="shrink-0 text-accent-ink" />
    </Link>
  );
}
