import Link from "next/link";
import { CATEGORY_META, TOOLS, type ToolCategory } from "@/lib/tools/catalog";
import { ToolIcon } from "@/components/tools/ToolIcon";

const CATEGORIES = (Object.keys(CATEGORY_META) as ToolCategory[]).sort(
  (a, b) => CATEGORY_META[a].order - CATEGORY_META[b].order,
);

export default function ToolsPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-8 sm:py-12">
      <section className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">Teacher tools</h1>
        <p className="max-w-2xl text-ink-soft">
          Plan, assess, differentiate, and communicate faster. Every tool runs on a model hosted on
          your own machine or your district&apos;s server, so lesson materials and student work never
          go to a third-party AI company.
        </p>
      </section>

      {CATEGORIES.map((category) => {
        const tools = TOOLS.filter((t) => t.category === category);
        if (tools.length === 0) return null;
        return (
          <section key={category} className="flex flex-col gap-3">
            <h2 className="text-xs font-bold uppercase tracking-wide text-ink-faint">
              {CATEGORY_META[category].label}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {tools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.id}`}
                  className="flex items-start gap-3 rounded-2xl border border-line bg-paper-raised p-4 transition-all hover:-translate-y-0.5 hover:border-plum hover:shadow-sm"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-plum-soft text-plum-ink">
                    <ToolIcon name={tool.icon} />
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="font-display font-bold text-ink">{tool.name}</span>
                    <span className="text-sm text-ink-soft">{tool.description}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
