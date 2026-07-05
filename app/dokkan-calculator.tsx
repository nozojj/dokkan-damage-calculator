"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  calculateDamage,
  TYPE_MATCHUP_COEFFICIENT,
  type TypeMatchup,
} from "./lib/dokkan-damage";
import {
  DOKKAN_CLASSES,
  DOKKAN_CLASS_LABELS,
  DOKKAN_RARITIES,
  DOKKAN_RARITY_LABELS,
  DOKKAN_TYPES,
  DOKKAN_TYPE_LABELS,
  characterTag,
  type DokkanCharacter,
  type DokkanType,
} from "./lib/characters";
import type { Enemy } from "./lib/enemies";
import type { Stage } from "./lib/stages";
import type { LinkSkill } from "./lib/linkSkills";
import type { SupportItem } from "./lib/supportItems";
import { NumberField } from "./components/number-field";
import { SearchableSelect } from "./components/searchable-select";
import { SourceAttributions } from "./components/source-attributions";

function typeLabel(type: DokkanType) {
  return DOKKAN_TYPE_LABELS[type];
}

function enemyTag(e: Enemy) {
  return `[${typeLabel(e.type)}] ${e.name}`;
}
import {
  createCharacter,
  createEnemy,
  createLinkSkill,
  createStage,
  createSupportItem,
  deleteCharacter,
  deleteEnemy,
  deleteLinkSkill,
  deleteStage,
  deleteSupportItem,
  updateCharacterLinks,
} from "./lib/actions";

const TYPE_MATCHUP_OPTIONS: { value: TypeMatchup; label: string }[] = [
  { value: "advantage", label: `有利(抜群) ×${TYPE_MATCHUP_COEFFICIENT.advantage}` },
  { value: "favorable", label: `得意 ×${TYPE_MATCHUP_COEFFICIENT.favorable}` },
  { value: "neutral", label: `五分 ×${TYPE_MATCHUP_COEFFICIENT.neutral}` },
  { value: "disadvantage", label: `不利 ×${TYPE_MATCHUP_COEFFICIENT.disadvantage}` },
];

function CharacterManager({
  characters,
  linkSkills,
  supportItems,
}: {
  characters: DokkanCharacter[];
  linkSkills: LinkSkill[];
  supportItems: SupportItem[];
}) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        キャラクター管理
      </h2>

      <form
        key={characters.length}
        action={createCharacter}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">キャラ名</span>
          <input
            type="text"
            name="name"
            required
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">属性 (Type)</span>
          <select
            name="type"
            defaultValue={DOKKAN_TYPES[0]}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            {DOKKAN_TYPES.map((t) => (
              <option key={t} value={t}>
                {typeLabel(t)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">レア度</span>
          <select
            name="rarity"
            defaultValue={DOKKAN_RARITIES[0]}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            {DOKKAN_RARITIES.map((r) => (
              <option key={r} value={r}>
                {DOKKAN_RARITY_LABELS[r]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">クラス</span>
          <select
            name="class"
            defaultValue={DOKKAN_CLASSES[0]}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            {DOKKAN_CLASSES.map((cl) => (
              <option key={cl} value={cl}>
                {DOKKAN_CLASS_LABELS[cl]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">基本ATK</span>
          <input
            type="number"
            name="baseAtk"
            step="1"
            required
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">基本DEF</span>
          <input
            type="number"
            name="baseDef"
            step="1"
            required
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">気力倍率</span>
          <input
            type="number"
            name="kiMultiplier"
            step="any"
            required
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">必殺技倍率</span>
          <input
            type="number"
            name="superAttackMultiplier"
            step="any"
            required
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">
            リーダースキルATK倍率(任意)
          </span>
          <input
            type="number"
            name="leaderSkillMultiplier"
            step="any"
            placeholder="例: 1.7"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            パーティ編成のリーダースキル合成プレビュー用
          </span>
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">
            出典URL(Dokkan Battle Wiki)
          </span>
          <input
            type="url"
            name="sourceUrl"
            placeholder="https://dbz-dokkanbattle.fandom.com/wiki/..."
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            CC BY-SA 3.0での出典表示に使用。該当キャラのWikiページURLを入力
          </span>
        </label>
        <button
          type="submit"
          className="sm:col-span-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          追加
        </button>
      </form>

      {characters.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer select-none font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            登録済みキャラクター一覧を表示({characters.length}件)
          </summary>
          <ul className="mt-2 flex max-h-96 flex-col divide-y divide-zinc-200 overflow-auto dark:divide-zinc-800">
            {characters.map((c) => (
              <li key={c.id} className="flex items-start justify-between gap-2 py-2 text-sm">
                <div className="flex flex-col gap-0.5 text-zinc-800 dark:text-zinc-200">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {typeLabel(c.type)} / {DOKKAN_RARITY_LABELS[c.rarity]} / {DOKKAN_CLASS_LABELS[c.class]}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    攻撃{c.baseAtk.toLocaleString()} ・ 防御{c.baseDef.toLocaleString()} ・ 必殺倍率×{c.superAttackMultiplier}
                    {c.leaderSkillMultiplier != null && ` ・ リーダー倍率×${c.leaderSkillMultiplier}`}
                  </span>
                  {(c.linkSkillIds.length > 0 ||
                    c.supportItemIds.length > 0 ||
                    c.partyMemberIds.length > 0) && (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {c.linkSkillIds.length > 0 &&
                        `リンク: ${c.linkSkillIds
                          .map((id) => linkSkills.find((l) => l.id === id)?.name)
                          .filter(Boolean)
                          .join(" / ")}`}
                      {c.linkSkillIds.length > 0 &&
                        (c.supportItemIds.length > 0 || c.partyMemberIds.length > 0) &&
                        " ・ "}
                      {c.supportItemIds.length > 0 &&
                        `サポート: ${c.supportItemIds
                          .map((id) => supportItems.find((s) => s.id === id)?.name)
                          .filter(Boolean)
                          .join(" / ")}`}
                      {c.supportItemIds.length > 0 && c.partyMemberIds.length > 0 && " ・ "}
                      {c.partyMemberIds.length > 0 &&
                        `味方: ${c.partyMemberIds
                          .map((id) => characters.find((other) => other.id === id)?.name)
                          .filter(Boolean)
                          .join(" / ")}`}
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {c.sourceUrl && (
                    <a
                      href={c.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                    >
                      出典
                    </a>
                  )}
                  <form action={deleteCharacter}>
                    <input type="hidden" name="id" value={c.id} />
                    <button
                      type="submit"
                      className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:border-red-400 hover:text-red-600 dark:border-zinc-700 dark:text-zinc-400"
                    >
                      削除
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

function EnemyManager({ enemies }: { enemies: Enemy[] }) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">敵管理</h2>

      <form
        key={enemies.length}
        action={createEnemy}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">敵名</span>
          <input
            type="text"
            name="name"
            required
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">属性</span>
          <select
            name="type"
            defaultValue={DOKKAN_TYPES[0]}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            {DOKKAN_TYPES.map((t) => (
              <option key={t} value={t}>
                {typeLabel(t)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">ATK</span>
          <input
            type="number"
            name="atk"
            step="1"
            required
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">DEF</span>
          <input
            type="number"
            name="def"
            step="1"
            required
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">必殺技倍率</span>
          <input
            type="number"
            name="superAttackMultiplier"
            step="any"
            required
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">
            ガード・軽減率(%)
          </span>
          <input
            type="number"
            name="damageReductionPercent"
            step="any"
            defaultValue={0}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">
            出典URL(Dokkan Battle Wiki)
          </span>
          <input
            type="url"
            name="sourceUrl"
            placeholder="https://dbz-dokkanbattle.fandom.com/wiki/..."
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            CC BY-SA 3.0での出典表示に使用。該当敵のWikiページURLを入力
          </span>
        </label>
        <button
          type="submit"
          className="sm:col-span-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          追加
        </button>
      </form>

      {enemies.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer select-none font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            登録済み敵一覧を表示({enemies.length}件)
          </summary>
          <ul className="mt-2 flex max-h-96 flex-col divide-y divide-zinc-200 overflow-auto dark:divide-zinc-800">
            {enemies.map((e) => (
              <li key={e.id} className="flex items-start justify-between gap-2 py-2 text-sm">
                <div className="flex flex-col gap-0.5 text-zinc-800 dark:text-zinc-200">
                  <span className="font-medium">{e.name}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{typeLabel(e.type)}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    ATK{e.atk.toLocaleString()} ・ DEF{e.def.toLocaleString()} ・ 必殺倍率×
                    {e.superAttackMultiplier} ・ 軽減{e.damageReductionPercent}%
                  </span>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {e.sourceUrl && (
                    <a
                      href={e.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                    >
                      出典
                    </a>
                  )}
                  <form action={deleteEnemy}>
                    <input type="hidden" name="id" value={e.id} />
                    <button
                      type="submit"
                      className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:border-red-400 hover:text-red-600 dark:border-zinc-700 dark:text-zinc-400"
                    >
                      削除
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

function LinkSkillManager({ linkSkills }: { linkSkills: LinkSkill[] }) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        リンクスキル管理
      </h2>
      <p className="-mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        同じリンク名を持つキャラ同士が隣接すると発動する共通マスタです。下の「キャラ紐付け」で各キャラに紐付けます。
      </p>

      <form
        key={linkSkills.length}
        action={createLinkSkill}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">リンク名</span>
          <input
            type="text"
            name="name"
            required
            placeholder="例: 透き通る愛"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">効果(任意)</span>
          <input
            type="text"
            name="description"
            placeholder="例: ATK & DEF +3%, 気力+2"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
        <button
          type="submit"
          className="sm:col-span-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          追加
        </button>
      </form>

      {linkSkills.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer select-none font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            登録済みリンクスキル一覧を表示({linkSkills.length}件)
          </summary>
          <ul className="mt-2 flex max-h-96 flex-col divide-y divide-zinc-200 overflow-auto dark:divide-zinc-800">
            {linkSkills.map((l) => (
              <li key={l.id} className="flex items-start justify-between gap-2 py-2 text-sm">
                <div className="flex flex-col gap-0.5 text-zinc-800 dark:text-zinc-200">
                  <span className="font-medium">{l.name}</span>
                  {l.description && (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">{l.description}</span>
                  )}
                </div>
                <form action={deleteLinkSkill}>
                  <input type="hidden" name="id" value={l.id} />
                  <button
                    type="submit"
                    className="shrink-0 rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:border-red-400 hover:text-red-600 dark:border-zinc-700 dark:text-zinc-400"
                  >
                    削除
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

function SupportItemManager({ supportItems }: { supportItems: SupportItem[] }) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        サポートアイテム管理
      </h2>
      <p className="-mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        サポートメモリーなどの装備アイテムの共通マスタです。下の「キャラ紐付け」で各キャラに紐付けます。
      </p>

      <form
        key={supportItems.length}
        action={createSupportItem}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">アイテム名</span>
          <input
            type="text"
            name="name"
            required
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">効果</span>
          <input
            type="text"
            name="effect"
            required
            placeholder="例: ATK+5000 DEF+3000"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
        <button
          type="submit"
          className="sm:col-span-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          追加
        </button>
      </form>

      {supportItems.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer select-none font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            登録済みサポートアイテム一覧を表示({supportItems.length}件)
          </summary>
          <ul className="mt-2 flex max-h-96 flex-col divide-y divide-zinc-200 overflow-auto dark:divide-zinc-800">
            {supportItems.map((s) => (
              <li key={s.id} className="flex items-start justify-between gap-2 py-2 text-sm">
                <div className="flex flex-col gap-0.5 text-zinc-800 dark:text-zinc-200">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{s.effect}</span>
                </div>
                <form action={deleteSupportItem}>
                  <input type="hidden" name="id" value={s.id} />
                  <button
                    type="submit"
                    className="shrink-0 rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:border-red-400 hover:text-red-600 dark:border-zinc-700 dark:text-zinc-400"
                  >
                    削除
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

function CharacterLinksForm({
  character,
  linkSkills,
  supportItems,
  characters,
}: {
  character: DokkanCharacter;
  linkSkills: LinkSkill[];
  supportItems: SupportItem[];
  characters: DokkanCharacter[];
}) {
  const [partyMembers, setPartyMembers] = useState<DokkanCharacter[]>(() =>
    character.partyMemberIds
      .map((id) => characters.find((c) => c.id === id))
      .filter((c): c is DokkanCharacter => !!c)
  );

  const partyMemberCandidates = useMemo(
    () => characters.filter((c) => c.id !== character.id && !partyMembers.some((p) => p.id === c.id)),
    [characters, character.id, partyMembers]
  );

  return (
    <form action={updateCharacterLinks} className="flex flex-col gap-3">
      <input type="hidden" name="characterId" value={character.id} />

      {linkSkills.length > 0 && (
        <fieldset className="flex flex-col gap-1">
          <legend className="mb-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            リンクスキル
          </legend>
          <div className="flex max-h-40 flex-col gap-1 overflow-auto rounded-md border border-zinc-300 p-2 dark:border-zinc-700">
            {linkSkills.map((l) => (
              <label key={l.id} className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
                <input
                  type="checkbox"
                  name="linkSkillIds"
                  value={l.id}
                  defaultChecked={character.linkSkillIds.includes(l.id)}
                  className="h-4 w-4"
                />
                {l.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {supportItems.length > 0 && (
        <fieldset className="flex flex-col gap-1">
          <legend className="mb-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            サポートアイテム
          </legend>
          <div className="flex max-h-40 flex-col gap-1 overflow-auto rounded-md border border-zinc-300 p-2 dark:border-zinc-700">
            {supportItems.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
                <input
                  type="checkbox"
                  name="supportItemIds"
                  value={s.id}
                  defaultChecked={character.supportItemIds.includes(s.id)}
                  className="h-4 w-4"
                />
                {s.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
          味方(パーティーメンバー)
        </legend>
        {partyMembers.length > 0 && (
          <ul className="flex flex-col gap-1">
            {partyMembers.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 text-sm text-zinc-800 dark:text-zinc-200">
                <span>{characterTag(p)}</span>
                <input type="hidden" name="partyMemberIds" value={p.id} />
                <button
                  type="button"
                  onClick={() => setPartyMembers((members) => members.filter((m) => m.id !== p.id))}
                  className="shrink-0 rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:border-red-400 hover:text-red-600 dark:border-zinc-700 dark:text-zinc-400"
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
        <SearchableSelect
          label="味方を追加"
          items={partyMemberCandidates}
          getKey={(c) => c.id}
          getLabel={characterTag}
          placeholder="キャラ名で検索"
          onSelect={(c) => setPartyMembers((members) => [...members, c])}
        />
      </fieldset>

      <button
        type="submit"
        className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        保存
      </button>
    </form>
  );
}

function CharacterLinksManager({
  characters,
  linkSkills,
  supportItems,
}: {
  characters: DokkanCharacter[];
  linkSkills: LinkSkill[];
  supportItems: SupportItem[];
}) {
  const [selectedCharacterId, setSelectedCharacterId] = useState("");
  const selectedCharacter = useMemo(
    () => characters.find((c) => c.id === selectedCharacterId) ?? null,
    [characters, selectedCharacterId]
  );

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">キャラ紐付け</h2>
      <p className="-mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        キャラを選んで、リンクスキル・サポートアイテム・味方(パーティーメンバー)を登録します。
      </p>

      <SearchableSelect
        label="キャラクター選択"
        items={characters}
        getKey={(c) => c.id}
        getLabel={characterTag}
        placeholder="キャラ名で検索"
        emptyHint='「キャラクター管理」から追加すると選択できます'
        onSelect={(c) => setSelectedCharacterId(c.id)}
      />

      {selectedCharacter && linkSkills.length === 0 && supportItems.length === 0 && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          先に「リンクスキル管理」「サポートアイテム管理」から登録すると選べます(味方は登録済みキャラからいつでも追加できます)。
        </p>
      )}

      {selectedCharacter && (
        <CharacterLinksForm
          key={selectedCharacter.id}
          character={selectedCharacter}
          linkSkills={linkSkills}
          supportItems={supportItems}
          characters={characters}
        />
      )}
    </section>
  );
}

function CreateStageForm() {
  const [enemyRows, setEnemyRows] = useState<number[]>([0]);
  const [mechanicRows, setMechanicRows] = useState<number[]>([0]);
  const nextEnemyRowId = useRef(1);
  const nextMechanicRowId = useRef(1);

  return (
    <form action={createStage} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">ステージ名</span>
          <input
            type="text"
            name="name"
            required
            placeholder="例: レッドゾーン ブロリー"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">イベント名</span>
          <input
            type="text"
            name="event"
            required
            placeholder="例: レッドゾーン"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">難易度</span>
          <input
            type="text"
            name="difficulty"
            required
            placeholder="例: STAGE8"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-800 dark:text-zinc-200">
          出典URL(任意)
        </span>
        <input
          type="url"
          name="sourceUrl"
          placeholder="https://dbz-dokkanbattle.fandom.com/wiki/..."
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
          このステージの敵(汎用の敵管理とは別に、このステージ専用として登録)
        </legend>
        {enemyRows.map((rowId) => (
          <div key={rowId} className="grid grid-cols-2 gap-2 sm:grid-cols-8">
            <input
              type="text"
              name="enemyName"
              placeholder="敵名"
              className="sm:col-span-2 rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <input
              type="number"
              name="enemyHp"
              placeholder="HP"
              className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <input
              type="number"
              name="enemyAtk"
              placeholder="ATK"
              className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <input
              type="number"
              name="enemyDef"
              placeholder="DEF"
              className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <input
              type="number"
              step="any"
              name="enemySuperAttackMultiplier"
              placeholder="必殺倍率"
              defaultValue={1}
              className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <input
              type="number"
              step="any"
              name="enemyGuardReduction"
              placeholder="軽減%"
              defaultValue={0}
              className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <div className="flex gap-1">
              <select
                name="enemyType"
                defaultValue={DOKKAN_TYPES[0]}
                className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                {DOKKAN_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {typeLabel(t)}
                  </option>
                ))}
              </select>
              {enemyRows.length > 1 && (
                <button
                  type="button"
                  onClick={() => setEnemyRows((rows) => rows.filter((id) => id !== rowId))}
                  className="shrink-0 rounded-md border border-zinc-300 px-2 text-xs text-zinc-600 hover:border-red-400 hover:text-red-600 dark:border-zinc-700 dark:text-zinc-400"
                >
                  削除
                </button>
              )}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setEnemyRows((rows) => [...rows, nextEnemyRowId.current++])}
          className="self-start rounded-md border border-zinc-300 px-3 py-1 text-xs text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400"
        >
          敵の行を追加
        </button>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
          ギミック・特殊ルール(メモ、計算には使用しません)
        </legend>
        {mechanicRows.map((rowId) => (
          <input
            key={rowId}
            type="text"
            name="mechanic"
            placeholder="例: 3ターン後に全体即死級ダメージ"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        ))}
        <button
          type="button"
          onClick={() => setMechanicRows((rows) => [...rows, nextMechanicRowId.current++])}
          className="self-start rounded-md border border-zinc-300 px-3 py-1 text-xs text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400"
        >
          ギミックの行を追加
        </button>
      </fieldset>

      <button
        type="submit"
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        追加
      </button>
    </form>
  );
}

const NEW_STAGE_OPTION = "__new__";

function RegisteredStagesList({ stages }: { stages: Stage[] }) {
  if (stages.length === 0) return null;

  return (
    <details className="text-sm sm:col-span-2">
      <summary className="cursor-pointer select-none font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
        登録済みステージ一覧を表示({stages.length}件)
      </summary>
      <ul className="mt-2 flex max-h-96 flex-col divide-y divide-zinc-200 overflow-auto dark:divide-zinc-800">
        {stages.map((s) => (
          <li key={s.id} className="flex flex-col gap-1 py-2 text-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-0.5 text-zinc-800 dark:text-zinc-200">
                <span className="font-medium">{s.name}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {s.event} / {s.difficulty} ・ 敵{s.enemyCount}体
                </span>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {s.sourceUrl && (
                  <a
                    href={s.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  >
                    出典
                  </a>
                )}
                <form action={deleteStage}>
                  <input type="hidden" name="id" value={s.id} />
                  <button
                    type="submit"
                    className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:border-red-400 hover:text-red-600 dark:border-zinc-700 dark:text-zinc-400"
                  >
                    削除
                  </button>
                </form>
              </div>
            </div>
            {s.enemies.length > 0 && (
              <ul className="ml-2 flex flex-col gap-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                {s.enemies.map((e) => (
                  <li key={e.id}>
                    {e.name}({typeLabel(e.type)}) HP{e.hp.toLocaleString()} ・ ATK
                    {e.atk.toLocaleString()} ・ DEF{e.def.toLocaleString()} ・ 必殺倍率×
                    {e.superAttackMultiplier} ・ 軽減{e.guardReduction}%
                  </li>
                ))}
              </ul>
            )}
            {s.mechanics.length > 0 && (
              <ul className="ml-2 flex flex-col gap-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                {s.mechanics.map((m) => (
                  <li key={m.id}>ギミック: {m.mechanic}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </details>
  );
}

export default function DokkanCalculator({
  characters,
  enemies,
  stages,
  linkSkills,
  supportItems,
}: {
  characters: DokkanCharacter[];
  enemies: Enemy[];
  stages: Stage[];
  linkSkills: LinkSkill[];
  supportItems: SupportItem[];
}) {
  const [baseAtk, setBaseAtk] = useState(10000);
  const [leaderSkillMultiplier, setLeaderSkillMultiplier] = useState(2.7);
  const [passiveMultiplier, setPassiveMultiplier] = useState(1.5);
  const [otherAtkMultiplier, setOtherAtkMultiplier] = useState(1.5);
  const [kiMultiplier, setKiMultiplier] = useState(2.0);
  const [superAttackMultiplier, setSuperAttackMultiplier] = useState(3.5);
  const [enemyDef, setEnemyDef] = useState(5000);
  const [enemyDamageReductionPercent, setEnemyDamageReductionPercent] = useState(0);
  const [typeMatchup, setTypeMatchup] = useState<TypeMatchup>("advantage");
  const [isCritical, setIsCritical] = useState(false);

  const [attackerCharacter, setAttackerCharacter] = useState<DokkanCharacter | null>(null);
  const [targetEnemy, setTargetEnemy] = useState<Enemy | null>(null);

  const [stageDamageStageId, setStageDamageStageId] = useState("");
  const [stageDamageEnemyId, setStageDamageEnemyId] = useState("");
  const [stageDamageCharacter, setStageDamageCharacter] = useState<DokkanCharacter | null>(null);
  const [stageDamageAllyDef, setStageDamageAllyDef] = useState(8000);
  const [stageDamageReductionPercent, setStageDamageReductionPercent] = useState(0);
  const [stageDamageTypeMatchup, setStageDamageTypeMatchup] = useState<TypeMatchup>("neutral");
  const [stageDamageIsCritical, setStageDamageIsCritical] = useState(false);

  const selectedDamageStage = useMemo(
    () => stages.find((s) => s.id === stageDamageStageId) ?? null,
    [stages, stageDamageStageId]
  );
  const selectedDamageStageEnemy = useMemo(
    () => selectedDamageStage?.enemies.find((e) => e.id === stageDamageEnemyId) ?? null,
    [selectedDamageStage, stageDamageEnemyId]
  );

  const knownStageIdsRef = useRef(new Set(stages.map((s) => s.id)));
  useEffect(() => {
    if (stageDamageStageId === NEW_STAGE_OPTION) {
      const newStage = stages.find((s) => !knownStageIdsRef.current.has(s.id));
      if (newStage) {
        setStageDamageStageId(newStage.id);
        setStageDamageEnemyId("");
      }
    }
    knownStageIdsRef.current = new Set(stages.map((s) => s.id));
  }, [stages, stageDamageStageId]);

  const result = useMemo(
    () =>
      calculateDamage({
        baseAtk,
        leaderSkillMultiplier,
        passiveMultiplier,
        otherAtkMultiplier,
        kiMultiplier,
        superAttackMultiplier,
        enemyDef,
        enemyDamageReductionPercent,
        typeMatchup,
        isCritical,
      }),
    [
      baseAtk,
      leaderSkillMultiplier,
      passiveMultiplier,
      otherAtkMultiplier,
      kiMultiplier,
      superAttackMultiplier,
      enemyDef,
      enemyDamageReductionPercent,
      typeMatchup,
      isCritical,
    ]
  );

  const stageIncomingResult = useMemo(() => {
    if (!selectedDamageStageEnemy) return null;
    return calculateDamage({
      baseAtk: selectedDamageStageEnemy.atk,
      leaderSkillMultiplier: 1,
      passiveMultiplier: 1,
      otherAtkMultiplier: 1,
      kiMultiplier: 1,
      superAttackMultiplier: selectedDamageStageEnemy.superAttackMultiplier,
      enemyDef: stageDamageAllyDef,
      enemyDamageReductionPercent: stageDamageReductionPercent,
      typeMatchup: stageDamageTypeMatchup,
      isCritical: stageDamageIsCritical,
    });
  }, [
    selectedDamageStageEnemy,
    stageDamageAllyDef,
    stageDamageReductionPercent,
    stageDamageTypeMatchup,
    stageDamageIsCritical,
  ]);

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-12 font-sans dark:bg-black sm:px-8">
      <main className="flex w-full max-w-2xl flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            ドッカンバトル ダメージ計算機
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            最終ATK = 基本ATK × リーダースキル倍率 × パッシブ倍率 × その他ATK倍率 × 気力倍率 × 必殺技倍率
          </p>
        </div>

        <CharacterManager characters={characters} linkSkills={linkSkills} supportItems={supportItems} />
        <EnemyManager enemies={enemies} />
        <LinkSkillManager linkSkills={linkSkills} />
        <SupportItemManager supportItems={supportItems} />
        <CharacterLinksManager
          characters={characters}
          linkSkills={linkSkills}
          supportItems={supportItems}
        />

        <h2 className="-mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          与ダメージ計算(自分の攻撃)
        </h2>
        <section className="grid grid-cols-1 gap-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 sm:grid-cols-2">
          <SearchableSelect
            label="キャラクター選択(自動入力)"
            items={characters}
            getKey={(c) => c.id}
            getLabel={characterTag}
            placeholder="キャラ名で検索"
            emptyHint='下の「キャラクター管理」から追加すると選択できます'
            onSelect={(c) => {
              setBaseAtk(c.baseAtk);
              setKiMultiplier(c.kiMultiplier);
              setSuperAttackMultiplier(c.superAttackMultiplier);
              setAttackerCharacter(c);
            }}
          />
          <NumberField label="基本ATK" value={baseAtk} onChange={setBaseAtk} step="1" />
          <NumberField
            label="リーダースキル倍率"
            value={leaderSkillMultiplier}
            onChange={setLeaderSkillMultiplier}
            hint="自身+フレンドのATK%UPを合算した倍率 (例: 各170%UPなら3.4)"
          />
          <NumberField
            label="パッシブ倍率"
            value={passiveMultiplier}
            onChange={setPassiveMultiplier}
            hint="ターン開始時・攻撃直前パッシブによるATK%UPを合算した倍率"
          />
          <NumberField
            label="その他ATK倍率"
            value={otherAtkMultiplier}
            onChange={setOtherAtkMultiplier}
            hint="リンクスキル・フィールド効果・サポートメモリーなどの合計倍率"
          />
          <NumberField
            label="気力倍率"
            value={kiMultiplier}
            onChange={setKiMultiplier}
            hint="気力ボーナスによる倍率 (例: LRで気力24なら2.0)"
          />
          <NumberField
            label="必殺技倍率"
            value={superAttackMultiplier}
            onChange={setSuperAttackMultiplier}
            hint="通常攻撃の場合は1"
          />
          <SearchableSelect
            label="敵選択(自動入力)"
            items={enemies}
            getKey={(e) => e.id}
            getLabel={enemyTag}
            placeholder="敵名で検索"
            emptyHint='「敵管理」から追加すると選択できます'
            onSelect={(e) => {
              setEnemyDef(e.def);
              setEnemyDamageReductionPercent(e.damageReductionPercent);
              setTargetEnemy(e);
            }}
          />
          <NumberField label="敵DEF" value={enemyDef} onChange={setEnemyDef} step="1" />
          <NumberField
            label="敵ダメージ軽減率(%)"
            value={enemyDamageReductionPercent}
            onChange={setEnemyDamageReductionPercent}
            hint="ガードなどによる軽減。無ければ0"
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
            {isCritical && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                会心発生時は属性相性を無視して固定倍率になります
              </span>
            )}
          </label>

          <label className="flex items-center gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200 sm:col-span-2">
            <input
              type="checkbox"
              checked={isCritical}
              onChange={(e) => setIsCritical(e.target.checked)}
              className="h-4 w-4"
            />
            会心(クリティカル)発生
            <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
              敵DEFを無視し、ダメージ倍率が固定1.875倍になります
            </span>
          </label>
        </section>

        <section className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">計算結果</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <dt>最終ATK</dt>
            <dd className="text-right tabular-nums">{Math.floor(result.finalAtk).toLocaleString()}</dd>
            <dt>参照DEF(会心時は0)</dt>
            <dd className="text-right tabular-nums">{result.effectiveDef.toLocaleString()}</dd>
            <dt>ATK-DEF</dt>
            <dd className="text-right tabular-nums">{Math.floor(result.atkMinusDef).toLocaleString()}</dd>
            <dt>適用係数</dt>
            <dd className="text-right tabular-nums">×{result.coefficient}</dd>
          </dl>
          <div className="mt-2 flex items-baseline justify-between border-t border-zinc-200 pt-3 dark:border-zinc-800">
            <span className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              最終ダメージ
            </span>
            <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">
              {result.damage.toLocaleString()}
            </span>
          </div>
          <SourceAttributions items={[attackerCharacter, targetEnemy]} />
        </section>

        <p className="rounded-lg border border-zinc-200 bg-white p-5 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
          被ダメージ計算(敵からの攻撃)は「
          <Link href="/tools/incoming-damage" className="underline hover:text-zinc-900 dark:hover:text-zinc-100">
            被ダメージ計算(パーティ)
          </Link>
          」に移動しました。保存済みパーティを選ぶと6人分の被ダメージを一括で計算できます。
        </p>

        <h2 className="-mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          ステージ被ダメージ計算(選択した1キャラ分)
        </h2>
        <section className="grid grid-cols-1 gap-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="font-medium text-zinc-800 dark:text-zinc-200">ステージ選択</span>
            <select
              value={stageDamageStageId}
              onChange={(e) => {
                setStageDamageStageId(e.target.value);
                setStageDamageEnemyId("");
              }}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">選択してください</option>
              <option value={NEW_STAGE_OPTION}>+ 新しいステージを登録</option>
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}({s.event} / {s.difficulty})
                </option>
              ))}
            </select>
          </label>

          {stageDamageStageId === NEW_STAGE_OPTION && (
            <div className="sm:col-span-2 rounded-md border border-zinc-300 p-4 dark:border-zinc-700">
              <CreateStageForm key={stages.length} />
            </div>
          )}

          {selectedDamageStage && (
            <label className="flex flex-col gap-1 text-sm sm:col-span-2">
              <span className="font-medium text-zinc-800 dark:text-zinc-200">敵選択</span>
              <select
                value={stageDamageEnemyId}
                onChange={(e) => setStageDamageEnemyId(e.target.value)}
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="">選択してください</option>
                {selectedDamageStage.enemies.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}({typeLabel(e.type)}) ATK{e.atk.toLocaleString()} ・ 必殺倍率×
                    {e.superAttackMultiplier}
                  </option>
                ))}
              </select>
              {selectedDamageStage.enemies.length === 0 && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  このステージには敵が登録されていません
                </span>
              )}
            </label>
          )}

          <RegisteredStagesList stages={stages} />

          <SearchableSelect
            label="被弾するキャラクター選択(自動入力)"
            items={characters}
            getKey={(c) => c.id}
            getLabel={characterTag}
            placeholder="キャラ名で検索"
            emptyHint='下の「キャラクター管理」から追加すると選択できます'
            onSelect={(c) => {
              setStageDamageAllyDef(c.baseDef);
              setStageDamageCharacter(c);
            }}
          />
          <NumberField
            label="味方DEF"
            value={stageDamageAllyDef}
            onChange={setStageDamageAllyDef}
            step="1"
          />
          <NumberField
            label="味方ダメージ軽減率(%)"
            value={stageDamageReductionPercent}
            onChange={setStageDamageReductionPercent}
            hint="ガード・被ダメ軽減パッシブなど。無ければ0"
          />

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-800 dark:text-zinc-200">属性相性</span>
            <select
              value={stageDamageTypeMatchup}
              onChange={(e) => setStageDamageTypeMatchup(e.target.value as TypeMatchup)}
              disabled={stageDamageIsCritical}
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
              checked={stageDamageIsCritical}
              onChange={(e) => setStageDamageIsCritical(e.target.checked)}
              className="h-4 w-4"
            />
            敵が会心(クリティカル)を発生
          </label>
        </section>

        <section className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">計算結果</h2>
          {!selectedDamageStageEnemy || !stageDamageCharacter || !stageIncomingResult ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              ステージ・敵・キャラクターを選択すると被ダメージを計算します
            </p>
          ) : (
            <>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                <dt>参照DEF(会心時は0)</dt>
                <dd className="text-right tabular-nums">
                  {stageIncomingResult.effectiveDef.toLocaleString()}
                </dd>
                <dt>ATK-DEF</dt>
                <dd className="text-right tabular-nums">
                  {Math.floor(stageIncomingResult.atkMinusDef).toLocaleString()}
                </dd>
                <dt>適用係数</dt>
                <dd className="text-right tabular-nums">×{stageIncomingResult.coefficient}</dd>
              </dl>
              <div className="mt-2 flex items-baseline justify-between border-t border-zinc-200 pt-3 dark:border-zinc-800">
                <span className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  被ダメージ({stageDamageCharacter.name})
                </span>
                <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">
                  {stageIncomingResult.damage.toLocaleString()}
                </span>
              </div>
              <SourceAttributions items={[selectedDamageStage]} />
            </>
          )}
        </section>
      </main>
    </div>
  );
}
