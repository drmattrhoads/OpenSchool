import type { StageType } from "./types";

interface StageStyle {
  dotBg: string;
  dotBorder: string;
  tagText: string;
  chipText: string;
}

export const STAGE_STYLES: Record<StageType, StageStyle> = {
  adult: {
    dotBg: "bg-accent-soft",
    dotBorder: "border-accent",
    tagText: "text-accent-ink",
    chipText: "text-accent-ink",
  },
  college: {
    dotBg: "bg-blue-soft",
    dotBorder: "border-blue",
    tagText: "text-blue-ink",
    chipText: "text-blue-ink",
  },
  university: {
    dotBg: "bg-plum-soft",
    dotBorder: "border-plum",
    tagText: "text-plum-ink",
    chipText: "text-plum-ink",
  },
  career: {
    dotBg: "bg-amber-soft",
    dotBorder: "border-amber",
    tagText: "text-amber-ink",
    chipText: "text-amber-ink",
  },
};

export function stageStyle(stageType: StageType): StageStyle {
  return STAGE_STYLES[stageType];
}
