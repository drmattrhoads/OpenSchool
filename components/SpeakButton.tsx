"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

function pickVoice(voices: SpeechSynthesisVoice[], lang: string) {
  const exact = voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase());
  if (exact) return exact;
  const prefix = voices.find((v) => v.lang.toLowerCase().startsWith(lang.slice(0, 2)));
  return prefix ?? voices[0];
}

function noopSubscribe() {
  return () => {};
}

function getSpeechSupportSnapshot() {
  return "speechSynthesis" in window;
}

function getServerSpeechSupportSnapshot() {
  return false;
}

export function SpeakButton({ text, className = "" }: { text: string; className?: string }) {
  const { lang, ui } = useLanguage();
  const [speaking, setSpeaking] = useState(false);
  const supported = useSyncExternalStore(
    noopSubscribe,
    getSpeechSupportSnapshot,
    getServerSpeechSupportSnapshot,
  );
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!supported) return;
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [supported]);

  if (!supported) return null;

  const bcp47 = lang === "es" ? "es-US" : "en-US";

  const handleClick = () => {
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = bcp47;
    const voices = synth.getVoices();
    const voice = pickVoice(voices, bcp47);
    if (voice) utter.voice = voice;
    utter.rate = 0.95;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    utterRef.current = utter;
    synth.speak(utter);
    setSpeaking(true);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={speaking ? ui.stopListening : ui.listen}
      aria-pressed={speaking}
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-paper-raised text-ink-soft transition-colors hover:border-accent hover:text-accent-ink ${className}`}
    >
      {speaking ? <VolumeX size={17} /> : <Volume2 size={17} />}
    </button>
  );
}
