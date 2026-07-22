import Link from "next/link";
import type { Career } from "@/lib/types";
import { ICONS, DEFAULT_ICON } from "@/lib/icons";
import { Chip } from "./Chip";

const DEMAND_KEY: Record<Career["demand"], "demandHigh" | "demandMedium" | "demandGrowing"> = {
  high: "demandHigh",
  medium: "demandMedium",
  growing: "demandGrowing",
};

export function CareerTile({
  career,
  t,
  ui,
}: {
  career: Career;
  t: (b: { en: string; es: string }) => string;
  ui: Record<string, string>;
}) {
  const Icon = (ICONS[career.icon] ?? DEFAULT_ICON);
  return (
    <Link
      href={`/careers/${career.id}`}
      className="group flex flex-col gap-3 rounded-2xl border border-line bg-paper-raised p-4 transition-all hover:-translate-y-0.5 hover:border-amber hover:shadow-sm"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-soft text-amber-ink">
        <Icon size={22} />
      </span>
      <span className="font-display text-base font-bold leading-tight text-ink">
        {t(career.title)}
      </span>
      <span className="flex flex-wrap gap-1.5">
        <Chip className="tabular bg-amber-soft text-amber-ink">
          ${career.wageHourly}
          {ui.perHour}
        </Chip>
        <Chip>{ui[DEMAND_KEY[career.demand]]}</Chip>
      </span>
    </Link>
  );
}
