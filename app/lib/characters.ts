export type DokkanType = "STR" | "AGL" | "TEQ" | "INT" | "PHY";

export const DOKKAN_TYPES: DokkanType[] = ["STR", "AGL", "TEQ", "INT", "PHY"];

export const DOKKAN_TYPE_LABELS: Record<DokkanType, string> = {
  STR: "力(STR)",
  AGL: "速(AGL)",
  TEQ: "技(TEQ)",
  INT: "知(INT)",
  PHY: "体(PHY)",
};

export type DokkanRarity = "SSR" | "UR" | "LR";

export const DOKKAN_RARITIES: DokkanRarity[] = ["SSR", "UR", "LR"];

export const DOKKAN_RARITY_LABELS: Record<DokkanRarity, string> = {
  SSR: "超(SSR)",
  UR: "超級(UR)",
  LR: "極(LR)",
};

/** カードクラス(超クラス/極クラス)。レア度(SSR/LR)とは別軸の区分 */
export type DokkanClass = "SUPER" | "EXTREME";

export const DOKKAN_CLASSES: DokkanClass[] = ["SUPER", "EXTREME"];

export const DOKKAN_CLASS_LABELS: Record<DokkanClass, string> = {
  SUPER: "超(Super)",
  EXTREME: "極(Extreme)",
};

export interface DokkanCharacter {
  id: string;
  name: string;
  type: DokkanType;
  rarity: DokkanRarity;
  class: DokkanClass;
  baseAtk: number;
  baseDef: number;
  /** このキャラ自身の気力ボーナス最大倍率 (例: LRなら2.0) */
  kiMultiplier: number;
  /** 必殺技倍率の基準値 (例: 超特大Lv1なら3.5) */
  superAttackMultiplier: number;
  /** リーダースキルのATK倍率(任意)。パーティ編成でのリーダースキル合成プレビューに使用 */
  leaderSkillMultiplier: number | null;
  /** Dragon Ball Z Dokkan Battle Wiki (Fandom) 上の該当キャラページURL。出典表示に使用 */
  sourceUrl: string | null;
  /** 紐付けられたリンクスキルのID一覧 */
  linkSkillIds: string[];
  /** 紐付けられたサポートアイテムのID一覧 */
  supportItemIds: string[];
  /** よく組むパーティーメンバーとして登録した他キャラのID一覧 */
  partyMemberIds: string[];
}

export function characterTag(c: DokkanCharacter): string {
  return `[${DOKKAN_TYPE_LABELS[c.type]} / ${DOKKAN_RARITY_LABELS[c.rarity]} / ${DOKKAN_CLASS_LABELS[c.class]}] ${c.name}`;
}
