import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { ModelStatus } from "@/components/tools/ModelStatus";

export const metadata: Metadata = {
  title: "OpenSchool Teacher Tools",
  description: "AI teacher tools that run entirely on a local model. Nothing leaves your machine.",
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="no-print sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/tools" className="flex items-center gap-2 font-display text-lg font-extrabold text-ink">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-plum text-white">
              <GraduationCap size={18} />
            </span>
            OpenSchool
          </Link>
          <ModelStatus />
        </div>
      </header>
      {children}
    </>
  );
}
