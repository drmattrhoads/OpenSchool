"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function LanguageToggle() {
  const { toggleLang, ui } = useLanguage();
  return (
    <button
      type="button"
      onClick={toggleLang}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line bg-paper-raised px-3 text-sm font-semibold text-ink-soft transition-colors hover:border-accent hover:text-accent-ink"
    >
      <Languages size={18} />
      {ui.langButton}
    </button>
  );
}
