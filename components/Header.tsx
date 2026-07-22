"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home, Briefcase, MapPin } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { LanguageToggle } from "./LanguageToggle";

export function Header() {
  const { ui } = useLanguage();
  const pathname = usePathname();

  const links = [
    { href: "/", label: ui.home, icon: Home },
    { href: "/careers", label: ui.careers, icon: Briefcase },
    { href: "/explore", label: ui.explore, icon: MapPin },
  ];

  return (
    <header className="no-print sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" aria-label={ui.appName} className="flex items-center gap-2 font-display text-lg font-extrabold text-ink">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent text-white">
            <Compass size={18} />
          </span>
          <span className="hidden sm:inline">{ui.appName}</span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-2.5 text-sm font-semibold transition-colors sm:justify-start sm:px-3 ${
                  active
                    ? "bg-accent-soft text-accent-ink"
                    : "text-ink-soft hover:bg-code-bg"
                }`}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
        <LanguageToggle />
      </div>
    </header>
  );
}
