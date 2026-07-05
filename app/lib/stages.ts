import type { DokkanType } from "./characters";

export interface StageEnemy {
  id: string;
  name: string;
  hp: number;
  atk: number;
  def: number;
  type: DokkanType;
}

export interface StageMechanic {
  id: string;
  mechanic: string;
}

/** クエスト/イベントのステージ攻略メモ。ダメージ計算とは独立した参照用データ */
export interface Stage {
  id: string;
  name: string;
  event: string;
  difficulty: string;
  enemyCount: number;
  enemies: StageEnemy[];
  mechanics: StageMechanic[];
}
