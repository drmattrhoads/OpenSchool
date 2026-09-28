import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTool, TOOLS } from "@/lib/tools/catalog";
import { ToolIcon } from "@/components/tools/ToolIcon";
import { ToolRunner } from "@/components/tools/ToolRunner";

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ toolId: tool.id }));
}

export default async function ToolPage({ params }: { params: Promise<{ toolId: string }> }) {
  const { toolId } = await params;
  const tool = getTool(toolId);
  if (!tool) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 sm:py-10">
      <div className="no-print">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-accent-ink">
          <ArrowLeft size={16} />
          All tools
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-plum-soft text-plum-ink">
            <ToolIcon name={tool.icon} size={22} />
          </span>
          <h1 className="font-display text-2xl font-extrabold text-ink">{tool.name}</h1>
        </div>
        <p className="mt-2 text-sm text-ink-soft">{tool.description}</p>
      </div>
      <ToolRunner key={tool.id} tool={tool} />
    </div>
  );
}
