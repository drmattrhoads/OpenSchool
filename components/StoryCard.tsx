import Link from "next/link";
import type { Pathway } from "@/lib/types";
import { ICONS, DEFAULT_ICON } from "@/lib/icons";
import { FIELD_META } from "@/lib/data";

export function StoryCard({
  pathway,
  t,
}: {
  pathway: Pathway;
  t: (b: { en: string; es: string }) => string;
}) {
  if (!pathway.story) return null;
  const Icon = (ICONS[FIELD_META[pathway.field].icon] ?? DEFAULT_ICON);
  return (
    <Link
      href={`/pathway/${pathway.id}`}
      className="flex w-72 shrink-0 flex-col gap-3 rounded-2xl border border-line bg-paper-raised p-4 transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-sm sm:w-80"
    >
      <div className="flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent-ink">
          <Icon size={18} />
        </span>
        <span className="font-display text-base font-bold text-ink">{pathway.story.name}</span>
      </div>
      <p className="text-sm leading-relaxed text-ink-soft">&ldquo;{t(pathway.story.quote)}&rdquo;</p>
    </Link>
  );
}
