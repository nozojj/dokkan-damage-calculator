import type { DokkanType } from "./characters";

export interface StageEnemy {
  id: string;
  name: string;
  hp: number;
  atk: number;
  def: number;
  type: DokkanType;
  /** この敵の必殺技倍率。被ダメージ計算(敵からの攻撃)に使用 */
  superAttackMultiplier: number;
}

export interface StageMechanic {
  id: string;
  mechanic: string;
}

/** クエスト/イベントのステージ攻略メモ。敵の被ダメージ計算(1キャラ分)にも使用 */
export interface Stage {
  id: string;
  name: string;
  event: string;
  difficulty: string;
  enemyCount: number;
  enemies: StageEnemy[];
  mechanics: StageMechanic[];
}
