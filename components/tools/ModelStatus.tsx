"use client";

import { useEffect, useState } from "react";
import { Cpu } from "lucide-react";

interface Status {
  ok: boolean;
  baseUrl: string;
  model: string | null;
  error?: string;
}

export function ModelStatus() {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/ai/status")
      .then((res) => res.json())
      .then((data: Status) => !cancelled && setStatus(data))
      .catch(() => !cancelled && setStatus({ ok: false, baseUrl: "", model: null, error: "Status check failed." }));
    return () => {
      cancelled = true;
    };
  }, []);

  if (!status) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs text-ink-faint">
        <Cpu size={13} /> Checking local model…
      </span>
    );
  }

  return (
    <span
      title={status.error ?? status.baseUrl}
      className={`inline-flex max-w-full items-center gap-1.5 truncate rounded-full px-3 py-1 text-xs font-semibold ${
        status.ok ? "bg-accent-soft text-accent-ink" : "bg-amber-soft text-amber-ink"
      }`}
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${status.ok ? "bg-accent" : "bg-amber"}`} />
      {status.ok ? `Local model: ${status.model}` : "Local model offline"}
    </span>
  );
}
