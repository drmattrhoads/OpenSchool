import Link from "next/link";
import { MapPin } from "lucide-react";
import type { School } from "@/lib/types";
import { ICONS, DEFAULT_ICON } from "@/lib/icons";
import { getProgramsForSchool } from "@/lib/data";

export function SchoolCard({
  school,
  classesWord,
  classWordSingular,
}: {
  school: School;
  classesWord: string;
  classWordSingular: string;
}) {
  const Icon = (ICONS[school.icon] ?? DEFAULT_ICON);
  const count = getProgramsForSchool(school.id).length;
  const programsLabel = count === 1 ? classWordSingular : classesWord;
  return (
    <Link
      href={`/explore/${school.id}`}
      className="group flex items-center gap-4 rounded-2xl border border-line bg-paper-raised p-4 transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-sm"
    >
      {school.logoUrl ? (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-line bg-white p-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={school.logoUrl} alt="" className="h-full w-full object-contain" />
        </span>
      ) : (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
          <Icon size={22} />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block font-display text-base font-bold leading-tight text-ink">
          {school.name}
        </span>
        <span className="mt-0.5 flex items-center gap-1 text-xs text-ink-faint">
          <MapPin size={12} />
          {school.city}
        </span>
        <span className="mt-1 block text-xs font-semibold text-accent-ink">
          {count} {programsLabel}
        </span>
      </span>
    </Link>
  );
}
