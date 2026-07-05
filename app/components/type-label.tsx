import { DOKKAN_TYPE_COLORS, DOKKAN_TYPE_LABELS, type DokkanType } from "../lib/characters";

export function TypeLabel({ type }: { type: DokkanType }) {
  return <span className={`font-medium ${DOKKAN_TYPE_COLORS[type]}`}>{DOKKAN_TYPE_LABELS[type]}</span>;
}
