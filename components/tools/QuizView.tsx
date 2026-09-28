"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { Quiz } from "@/lib/tools/catalog";

const LETTERS = ["A", "B", "C", "D"];

export function quizToText(quiz: Quiz, withKey: boolean): string {
  const body = quiz.questions
    .map(
      (q, i) =>
        `${i + 1}. ${q.question}\n${q.choices.map((c, j) => `   ${LETTERS[j]}. ${c}`).join("\n")}`,
    )
    .join("\n\n");
  if (!withKey) return `${quiz.title}\n\n${body}`;
  const key = quiz.questions
    .map((q, i) => `${i + 1}. ${LETTERS[q.answerIndex]} — ${q.explanation}`)
    .join("\n");
  return `${quiz.title}\n\n${body}\n\nAnswer key\n${key}`;
}

export function QuizView({ quiz }: { quiz: Quiz }) {
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-extrabold text-ink">{quiz.title}</h2>
        <button
          type="button"
          onClick={() => setShowKey((s) => !s)}
          className="no-print inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft hover:border-accent hover:text-accent-ink"
        >
          {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
          {showKey ? "Hide answers" : "Show answers"}
        </button>
      </div>
      <ol className="flex flex-col gap-5">
        {quiz.questions.map((q, i) => (
          <li key={i} className="flex flex-col gap-2">
            <p className="font-semibold text-ink">
              {i + 1}. {q.question}
            </p>
            <ul className="flex flex-col gap-1 pl-4">
              {q.choices.map((choice, j) => {
                const correct = showKey && j === q.answerIndex;
                return (
                  <li
                    key={j}
                    className={`rounded-lg px-2 py-1 text-sm ${correct ? "bg-accent-soft font-semibold text-accent-ink" : "text-ink"}`}
                  >
                    {LETTERS[j]}. {choice}
                  </li>
                );
              })}
            </ul>
            {showKey && q.explanation && <p className="pl-4 text-sm text-ink-soft">{q.explanation}</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}
