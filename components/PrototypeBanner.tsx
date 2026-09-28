"use client";

import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function PrototypeBanner() {
  const { ui } = useLanguage();
  const pathname = usePathname();
  if (pathname.startsWith("/tools")) return null;
  return (
    <div className="no-print border-b border-line bg-amber-soft">
      <p className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-1.5 text-xs text-amber-ink">
        <Sparkles size={13} className="shrink-0" />
        <span>{ui.prototypeBanner}</span>
      </p>
    </div>
  );
}
