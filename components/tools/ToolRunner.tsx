"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AlertTriangle, Check, Copy, Loader2, Printer, ShieldCheck, Sparkles, Square } from "lucide-react";
import type { Quiz, ToolDef } from "@/lib/tools/catalog";
import { QuizView, quizToText } from "./QuizView";

const inputClass =
  "rounded-lg border border-line bg-paper px-3 py-2 text-sm font-normal text-ink focus:border-accent focus:outline-none";

function initialValues(tool: ToolDef): Record<string, string> {
  return Object.fromEntries(tool.fields.map((f) => [f.name, f.defaultValue ?? ""]));
}

export function ToolRunner({ tool }: { tool: ToolDef }) {
  const [values, setValues] = useState(() => initialValues(tool));
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState("");
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const missingRequired = tool.fields.some((f) => f.required && !values[f.name]?.trim());
  const hasOutput = Boolean(markdown || quiz);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setRunning(true);
    setError(null);
    setMarkdown("");
    setQuiz(null);

    try {
      const res = await fetch(`/api/tools/${tool.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status}).`);
      }
      if (tool.output === "quiz") {
        const data = (await res.json()) as { quiz: Quiz };
        setQuiz(data.quiz);
        return;
      }
      if (!res.body) throw new Error("No response from the model.");
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setMarkdown((prev) => prev + value);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setRunning(false);
      }
    }
  }

  function stop() {
    abortRef.current?.abort();
    abortRef.current = null;
    setRunning(false);
  }

  function copy() {
    const text = quiz ? quizToText(quiz, true) : markdown;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={run} className="no-print flex flex-col gap-4 rounded-2xl border border-line bg-paper-raised p-5">
        {tool.note && (
          <p className="flex items-start gap-2 rounded-xl bg-blue-soft p-3 text-xs text-blue-ink">
            <ShieldCheck size={15} className="mt-0.5 shrink-0" />
            {tool.note}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          {tool.fields.map((field) => (
            <label
              key={field.name}
              className={`flex flex-col gap-1 text-sm font-semibold text-ink ${
                field.type === "textarea" || field.type === "text" ? "sm:col-span-2" : ""
              }`}
            >
              <span>
                {field.label}
                {field.required && <span className="text-amber-ink"> *</span>}
              </span>
              {field.type === "select" ? (
                <select
                  value={values[field.name]}
                  onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                  className={inputClass}
                >
                  {!field.required && !field.defaultValue && <option value="">—</option>}
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  value={values[field.name]}
                  onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
                  rows={field.maxLength && field.maxLength > 3_000 ? 8 : 4}
                  className={`${inputClass} resize-y`}
                />
              ) : (
                <input
                  type="text"
                  value={values[field.name]}
                  onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
                  className={inputClass}
                />
              )}
              {field.help && <span className="text-xs font-normal text-ink-faint">{field.help}</span>}
            </label>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={running || missingRequired}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {running ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            {hasOutput && !running ? "Regenerate" : "Generate"}
          </button>
          {running && (
            <button
              type="button"
              onClick={stop}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink-soft hover:border-amber hover:text-amber-ink"
            >
              <Square size={13} /> Stop
            </button>
          )}
        </div>
      </form>

      {error && (
        <p className="flex items-start gap-2 rounded-xl bg-amber-soft p-3 text-sm text-amber-ink">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      {running && !hasOutput && (
        <p className="flex items-center gap-2 text-sm text-ink-soft">
          <Loader2 size={15} className="animate-spin" />
          {tool.output === "quiz"
            ? "Writing and checking your quiz…"
            : "Waiting for the model… the first run can take a moment while it loads into memory."}
        </p>
      )}

      {hasOutput && (
        <section className="flex flex-col gap-4 rounded-2xl border border-line bg-paper-raised p-5 sm:p-6">
          <div className="no-print flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={copy}
              disabled={running}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft hover:border-accent hover:text-accent-ink disabled:opacity-50"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              disabled={running}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft hover:border-accent hover:text-accent-ink disabled:opacity-50"
            >
              <Printer size={13} /> Print
            </button>
          </div>
          {quiz ? (
            <QuizView quiz={quiz} />
          ) : (
            <div className="md-output">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
            </div>
          )}
          <p className="no-print border-t border-line pt-3 text-xs text-ink-faint">
            AI-generated draft. Review for accuracy and fit before using it with students.
          </p>
        </section>
      )}
    </div>
  );
}
