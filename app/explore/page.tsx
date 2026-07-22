"use client";

import { useLanguage } from "@/lib/i18n";
import { SCHOOLS } from "@/lib/data";
import { SchoolCard } from "@/components/SchoolCard";

export default function ExplorePage() {
  const { ui } = useLanguage();
  const adultSchools = SCHOOLS.filter((s) => s.type === "adult");

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 sm:py-12">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-ink">{ui.exploreHeading}</h1>
        <p className="mt-1 text-sm text-ink-soft">{ui.exploreSub}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {adultSchools.map((school) => (
          <SchoolCard
            key={school.id}
            school={school}
            classesWord={ui.classesWord}
            classWordSingular={ui.classWordSingular}
          />
        ))}
      </div>
    </div>
  );
}
