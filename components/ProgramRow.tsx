import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Program } from "@/lib/types";
import { ICONS, DEFAULT_ICON } from "@/lib/icons";
import { getPathwaysForProgram } from "@/lib/data";
import { Chip } from "./Chip";

export function ProgramRow({
  program,
  t,
}: {
  program: Program;
  t: (b: { en: string; es: string }) => string;
}) {
  const Icon = (ICONS[program.icon] ?? DEFAULT_ICON);
  const pathways = getPathwaysForProgram(program.id);

  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
          <Icon size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-bold leading-snug text-ink">{t(program.title)}</p>
          <p className="mt-1 text-sm text-ink-soft">{t(program.description)}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Chip>{t(program.cost)}</Chip>
            <Chip>{t(program.duration)}</Chip>
            <Chip>{t(program.schedule)}</Chip>
          </div>
        </div>
      </div>
      {pathways.length > 0 && (
        <div className="mt-3 flex flex-col gap-1.5 border-t border-line pt-3">
          {pathways.map((p) => (
            <Link
              key={p.id}
              href={`/pathway/${p.id}`}
              className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-soft"
            >
              <span>{t(p.title)}</span>
              <ArrowRight size={15} className="shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
