/** リンクスキルの共通マスタ。同じリンク名を持つキャラ同士が隣接すると発動する(Dokkan本来の仕様) */
export interface LinkSkill {
  id: string;
  name: string;
  description: string | null;
}
