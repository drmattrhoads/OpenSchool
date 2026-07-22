"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { ArrowLeft, Printer, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { getPathway, getSchool } from "@/lib/data";
import { ICONS, DEFAULT_ICON } from "@/lib/icons";
import { stageStyle } from "@/lib/stageStyles";

const SITE_URL = "https://pathways.educationtocareer.net";

export default function PathwayPrintPage({
  params,
}: {
  params: Promise<{ pathwayId: string }>;
}) {
  const { pathwayId } = use(params);
  const { t, ui, lang } = useLanguage();
  const pathway = getPathway(pathwayId);
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    if (!pathway) return;
    QRCode.toDataURL(`${SITE_URL}/pathway/${pathway.id}`, {
      margin: 1,
      width: 200,
      color: { dark: "#1c2733", light: "#ffffff" },
    }).then(setQr);
  }, [pathway]);

  if (!pathway) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-ink-soft">{ui.notFound}</p>
      </div>
    );
  }

  const school = getSchool(pathway.nextStep.schoolId);
  const printedOn = new Date().toLocaleDateString(lang === "es" ? "es-MX" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      <div className="no-print flex items-center justify-between">
        <Link
          href={`/pathway/${pathway.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-accent-ink"
        >
          <ArrowLeft size={16} />
          {ui.back}
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Printer size={15} />
          {ui.print}
        </button>
      </div>

      <div className="rounded-2xl border border-line bg-paper-raised p-6 print:border-none print:p-0 print:shadow-none">
        <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ink-faint">
              {ui.printedFor}
            </p>
            <h1 className="mt-1 font-display text-xl font-extrabold leading-snug text-ink">
              {t(pathway.title)}
            </h1>
            <p className="mt-2 text-xs text-ink-faint">
              {ui.printedOn}: {printedOn}
            </p>
          </div>
          {qr && (
            <div className="flex shrink-0 flex-col items-center gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt="" width={110} height={110} className="rounded-lg" />
              <p className="max-w-[110px] text-center text-[10px] leading-tight text-ink-faint">
                {ui.printQrHelp}
              </p>
            </div>
          )}
        </div>

        <ol className="mt-5 flex flex-col gap-4">
          {pathway.steps.map((step, i) => {
            const style = stageStyle(step.stageType);
            const Icon = (ICONS[step.icon] ?? DEFAULT_ICON);
            return (
              <li key={i} className="flex gap-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${style.dotBg} ${style.dotBorder}`}
                >
                  <Icon size={15} className={style.tagText} />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-sm font-bold leading-snug text-ink">
                    {t(step.title)}
                  </p>
                  <p className="text-xs text-ink-soft">
                    {t(step.subtitle)} · {step.tags.map((tag) => t(tag)).join(" · ")}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        {school && (
          <div className="mt-5 rounded-xl bg-accent-soft p-4">
            <p className="font-display text-sm font-extrabold text-accent-ink">
              {ui.nextStepHeading}
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">{school.name}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-ink">
              <Phone size={12} />
              {school.phone}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink">
              <MapPin size={12} />
              {school.address}
            </p>
          </div>
        )}

        <p className="mt-5 border-t border-line pt-3 text-[10px] leading-relaxed text-ink-faint">
          {ui.prototypeBanner}
        </p>
      </div>
    </div>
  );
}
