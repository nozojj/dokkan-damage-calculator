"use client";

import { useMemo, useState } from "react";
import { SearchableSelect } from "../../components/searchable-select";
import { NumberField } from "../../components/number-field";
import { SourceAttributions } from "../../components/source-attributions";
import {
  calculateDamage,
  TYPE_MATCHUP_COEFFICIENT,
  type TypeMatchup,
} from "../../lib/dokkan-damage";
import { DOKKAN_TYPE_LABELS } from "../../lib/characters";
import type { Enemy } from "../../lib/enemies";
import { getActiveLinks, type Party } from "../../lib/party";
import type { LinkSkill } from "../../lib/linkSkills";

function enemyTag(e: Enemy) {
  return `[${DOKKAN_TYPE_LABELS[e.type]}] ${e.name}`;
}

const TYPE_MATCHUP_OPTIONS: { value: TypeMatchup; label: string }[] = [
  { value: "advantage", label: `有利(抜群) ×${TYPE_MATCHUP_COEFFICIENT.advantage}` },
  { value: "favorable", label: `得意 ×${TYPE_MATCHUP_COEFFICIENT.favorable}` },
  { value: "neutral", label: `五分 ×${TYPE_MATCHUP_COEFFICIENT.neutral}` },
  { value: "disadvantage", label: `不利 ×${TYPE_MATCHUP_COEFFICIENT.disadvantage}` },
];

export default function IncomingDamageClient({
  enemies,
  parties,
  linkSkills,
}: {
  enemies: Enemy[];
  parties: Party[];
  linkSkills: LinkSkill[];
}) {
  const [enemyAtk, setEnemyAtk] = useState(30000);
  const [enemySuperAttackMultiplier, setEnemySuperAttackMultiplier] = useState(1);
  const [selectedEnemy, setSelectedEnemy] = useState<Enemy | null>(null);
  const [selectedPartyId, setSelectedPartyId] = useState("");
  const [damageReductionPercent, setDamageReductionPercent] = useState(0);
  const [typeMatchup, setTypeMatchup] = useState<TypeMatchup>("neutral");
  const [isCritical, setIsCritical] = useState(false);

  const selectedParty = useMemo(
    () => parties.find((p) => p.id === selectedPartyId) ?? null,
    [parties, selectedPartyId]
  );

  const activeLinks = useMemo(
    () => (selectedParty ? getActiveLinks(selectedParty.members) : []),
    [selectedParty]
  );

  function linkNameFor(id: string) {
    return linkSkills.find((l) => l.id === id)?.name ?? id;
  }

  const rows = useMemo(() => {
    if (!selectedParty) return [];
    return selectedParty.members
      .slice()
      .sort((a, b) => a.slotIndex - b.slotIndex)
      .map((m) => ({
        slotIndex: m.slotIndex,
        character: m.character,
        result: calculateDamage({
          baseAtk: enemyAtk,
          leaderSkillMultiplier: 1,
          passiveMultiplier: 1,
          otherAtkMultiplier: 1,
          kiMultiplier: 1,
          superAttackMultiplier: enemySuperAttackMultiplier,
          enemyDef: m.character.baseDef,
          enemyDamageReductionPercent: damageReductionPercent,
          typeMatchup,
          isCritical,
        }),
      }));
  }, [selectedParty, enemyAtk, enemySuperAttackMultiplier, damageReductionPercent, typeMatchup, isCritical]);

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-12 font-sans dark:bg-black sm:px-8">
      <main className="flex w-full max-w-2xl flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            被ダメージ計算(パーティ)
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            敵とパーティを選ぶと、6メンバー全員分の被ダメージを一覧表示します。軽減率・属性相性・会心は6人共通です。
          </p>
        </div>

        <section className="grid grid-cols-1 gap-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 sm:grid-cols-2">
          <SearchableSelect
            label="敵選択(自動入力)"
            items={enemies}
            getKey={(e) => e.id}
            getLabel={enemyTag}
            placeholder="敵名で検索"
            emptyHint="敵管理から追加すると選択できます"
            onSelect={(e) => {
              setEnemyAtk(e.atk);
              setEnemySuperAttackMultiplier(e.superAttackMultiplier);
              setSelectedEnemy(e);
            }}
          />
          <NumberField
            label="敵ATK"
            value={enemyAtk}
            onChange={setEnemyAtk}
            step="1"
            hint="敵の最終ATK(敵側のリーダー/パッシブ等込みの数値)"
          />
          <NumberField
            label="敵必殺技倍率"
            value={enemySuperAttackMultiplier}
            onChange={setEnemySuperAttackMultiplier}
            hint="敵の通常攻撃なら1"
          />

          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="font-medium text-zinc-800 dark:text-zinc-200">パーティ選択</span>
            <select
              value={selectedPartyId}
              onChange={(e) => setSelectedPartyId(e.target.value)}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">選択してください</option>
              {parties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}({p.members.length}/6)
                </option>
              ))}
            </select>
            {parties.length === 0 && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                「パーティ編成」からパーティを作成すると選択できます
              </span>
            )}
          </label>

          <NumberField
            label="軽減率(%)"
            value={damageReductionPercent}
            onChange={setDamageReductionPercent}
            hint="ガード・被ダメ軽減パッシブなど。6人共通。無ければ0"
          />

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-800 dark:text-zinc-200">属性相性</span>
            <select
              value={typeMatchup}
              onChange={(e) => setTypeMatchup(e.target.value as TypeMatchup)}
              disabled={isCritical}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              {TYPE_MATCHUP_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200 sm:col-span-2">
            <input
              type="checkbox"
              checked={isCritical}
              onChange={(e) => setIsCritical(e.target.checked)}
              className="h-4 w-4"
            />
            敵が会心(クリティカル)を発生
          </label>
        </section>

        {selectedParty && (
          <section className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              発動リンク({selectedParty.name})
            </h2>
            {activeLinks.length === 0 ? (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                隣接スロットで一致するリンクスキルはありません
              </p>
            ) : (
              <ul className="flex flex-col gap-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                {activeLinks.map((link) => (
                  <li key={`${link.slotA}-${link.slotB}-${link.linkSkillId}`}>
                    スロット{link.slotA}-{link.slotB}: {linkNameFor(link.linkSkillId)}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <section className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            被ダメージ一覧
          </h2>
          {rows.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              敵とパーティを選択すると被ダメージを計算します
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                    <th className="py-1 pr-2">スロット</th>
                    <th className="py-1 pr-2">キャラ</th>
                    <th className="py-1 pr-2 text-right">参照DEF</th>
                    <th className="py-1 text-right">被ダメージ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {rows.map((row) => (
                    <tr key={row.slotIndex} className="text-zinc-800 dark:text-zinc-200">
                      <td className="py-1.5 pr-2 tabular-nums text-zinc-500 dark:text-zinc-400">
                        {row.slotIndex}
                      </td>
                      <td className="py-1.5 pr-2">{row.character.name}</td>
                      <td className="py-1.5 pr-2 text-right tabular-nums">
                        {row.result.effectiveDef.toLocaleString()}
                      </td>
                      <td className="py-1.5 text-right text-base font-semibold tabular-nums">
                        {row.result.damage.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <SourceAttributions items={[selectedEnemy]} />
        </section>
      </main>
    </div>
  );
}
