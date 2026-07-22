"use client";

import { useLanguage } from "@/lib/i18n";
import { ALL_FIELDS, FIELD_META, PATHWAYS, getSchool } from "@/lib/data";
import { ICONS, DEFAULT_ICON } from "@/lib/icons";
import { PathwayLinkCard } from "@/components/PathwayLinkCard";

export default function PathwaysIndexPage() {
  const { t, ui } = useLanguage();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-8 sm:py-12">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-ink">{ui.allPathwaysHeading}</h1>
        <p className="mt-1 text-sm text-ink-soft">{ui.allPathwaysSub}</p>
      </div>

      {ALL_FIELDS.map((field) => {
        const meta = FIELD_META[field];
        const Icon = ICONS[meta.icon] ?? DEFAULT_ICON;
        const pathways = PATHWAYS.filter((p) => p.field === field);
        if (pathways.length === 0) return null;

        return (
          <section key={field}>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-soft text-amber-ink">
                <Icon size={18} />
              </span>
              <h2 className="font-display text-xl font-extrabold text-ink">{t(meta.label)}</h2>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {pathways.map((pathway) => {
                const startSchool = getSchool(pathway.nextStep.schoolId);
                return (
                  <PathwayLinkCard
                    key={pathway.id}
                    pathway={pathway}
                    t={t}
                    extra={
                      startSchool ? (
                        <p className="mt-1 text-xs font-semibold text-ink-faint">
                          {ui.startsAt} {startSchool.name}
                        </p>
                      ) : undefined
                    }
                  />
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
