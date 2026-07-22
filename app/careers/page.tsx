"use client";

import { useLanguage } from "@/lib/i18n";
import { ALL_FIELDS, FIELD_META, getCareersByField } from "@/lib/data";
import { ICONS, DEFAULT_ICON } from "@/lib/icons";
import { CareerTile } from "@/components/CareerTile";

export default function CareersPage() {
  const { t, ui } = useLanguage();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-8 sm:py-12">
      <h1 className="font-display text-3xl font-extrabold text-ink">{ui.doorGoal}</h1>

      {ALL_FIELDS.map((field) => {
        const meta = FIELD_META[field];
        const Icon = (ICONS[meta.icon] ?? DEFAULT_ICON);
        const careers = getCareersByField(field);
        return (
          <section key={field} id={`field-${field}`} className="scroll-mt-20">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-soft text-amber-ink">
                <Icon size={18} />
              </span>
              <h2 className="font-display text-xl font-extrabold text-ink">{t(meta.label)}</h2>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {careers.map((career) => (
                <CareerTile key={career.id} career={career} t={t} ui={ui} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
