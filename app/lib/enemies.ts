import type { DokkanType } from "./characters";

export interface Enemy {
  id: string;
  name: string;
  type: DokkanType;
  atk: number;
  def: number;
  superAttackMultiplier: number;
  /** 敵自身のガード・被ダメージ軽減率(%)。プレイヤー側の攻撃に対する軽減 */
  damageReductionPercent: number;
  sourceUrl: string | null;
}

export interface Stage {
  id: string;
  name: string;
  enemies: Enemy[];
}
