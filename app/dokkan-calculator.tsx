"use client";

import { useMemo, useState } from "react";
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
  type DokkanCharacter,
} from "./lib/characters";

function typeLabel(type: DokkanCharacter["type"]) {
  return DOKKAN_TYPE_LABELS[type];
}

function characterTag(c: DokkanCharacter) {
  return `[${typeLabel(c.type)} / ${DOKKAN_RARITY_LABELS[c.rarity]} / ${DOKKAN_CLASS_LABELS[c.class]}] ${c.name}`;
}
import { createCharacter, deleteCharacter } from "./lib/actions";

const TYPE_MATCHUP_OPTIONS: { value: TypeMatchup; label: string }[] = [
  { value: "advantage", label: `有利(抜群) ×${TYPE_MATCHUP_COEFFICIENT.advantage}` },
  { value: "favorable", label: `得意 ×${TYPE_MATCHUP_COEFFICIENT.favorable}` },
  { value: "neutral", label: `五分 ×${TYPE_MATCHUP_COEFFICIENT.neutral}` },
  { value: "disadvantage", label: `不利 ×${TYPE_MATCHUP_COEFFICIENT.disadvantage}` },
];

function NumberField({
  label,
  value,
  onChange,
  step = "any",
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: string;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-zinc-800 dark:text-zinc-200">{label}</span>
      <input
        type="number"
        step={step}
        value={Number.isNaN(value) ? "" : value}
        onChange={(e) => onChange(e.target.valueAsNumber)}
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
      {hint && <span className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</span>}
    </label>
  );
}

function SourceAttributions({
  characters,
}: {
  characters: (DokkanCharacter | null)[];
}) {
  const withSource = characters.filter(
    (c): c is DokkanCharacter & { sourceUrl: string } => !!c?.sourceUrl
  );

  if (withSource.length === 0) return null;

  return (
    <div className="mt-3 flex flex-col gap-1 border-t border-zinc-200 pt-2 dark:border-zinc-800">
      {withSource.map((c) => (
        <p key={c.id} className="text-xs text-zinc-500 dark:text-zinc-400">
          出典:{" "}
          <a
            href={c.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            {c.name} - Dragon Ball Z Dokkan Battle Wiki
          </a>
        </p>
      ))}
    </div>
  );
}

const CHARACTER_SEARCH_RESULT_LIMIT = 50;

function CharacterSelect({
  label,
  characters,
  onSelect,
}: {
  label: string;
  characters: DokkanCharacter[];
  onSelect: (character: DokkanCharacter) => void;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? characters.filter((c) => characterTag(c).toLowerCase().includes(q))
      : characters;
    return matches.slice(0, CHARACTER_SEARCH_RESULT_LIMIT);
  }, [characters, query]);

  return (
    <div className="relative flex flex-col gap-1 text-sm sm:col-span-2">
      <span className="font-medium text-zinc-800 dark:text-zinc-200">{label}</span>
      <input
        type="text"
        value={query}
        disabled={characters.length === 0}
        placeholder={characters.length === 0 ? "未登録" : "キャラ名で検索"}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
      {characters.length === 0 && (
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          下の「キャラクター管理」から追加すると選択できます
        </span>
      )}
      {isOpen && characters.length > 0 && (
        <ul className="absolute top-full z-10 mt-1 max-h-64 w-full overflow-auto rounded-md border border-zinc-300 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">該当するキャラがいません</li>
          ) : (
            filtered.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onSelect(c);
                    setQuery(characterTag(c));
                    setIsOpen(false);
                  }}
                  className="block w-full px-3 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {characterTag(c)}
                </button>
              </li>
            ))
          )}
          {characters.length > filtered.length && (
            <li className="px-3 py-1 text-xs text-zinc-400 dark:text-zinc-500">
              他{characters.length - filtered.length}件あります。検索で絞り込んでください
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

function CharacterManager({ characters }: { characters: DokkanCharacter[] }) {
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
              <li key={c.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                <span className="text-zinc-800 dark:text-zinc-200">
                  {characterTag(c)}
                  <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                    ATK{c.baseAtk} / DEF{c.baseDef} / 気力×{c.kiMultiplier} / 必殺×{c.superAttackMultiplier}
                  </span>
                  {c.sourceUrl && (
                    <a
                      href={c.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-2 text-xs text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                    >
                      出典
                    </a>
                  )}
                </span>
                <form action={deleteCharacter}>
                  <input type="hidden" name="id" value={c.id} />
                  <button
                    type="submit"
                    className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:border-red-400 hover:text-red-600 dark:border-zinc-700 dark:text-zinc-400"
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

export default function DokkanCalculator({
  characters,
}: {
  characters: DokkanCharacter[];
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

  const [enemyAtk, setEnemyAtk] = useState(30000);
  const [enemySuperAttackMultiplier, setEnemySuperAttackMultiplier] = useState(1);
  const [allyDef, setAllyDef] = useState(8000);
  const [allyDamageReductionPercent, setAllyDamageReductionPercent] = useState(0);
  const [incomingTypeMatchup, setIncomingTypeMatchup] = useState<TypeMatchup>("neutral");
  const [enemyIsCritical, setEnemyIsCritical] = useState(false);

  const [attackerCharacter, setAttackerCharacter] = useState<DokkanCharacter | null>(null);
  const [enemyCharacter, setEnemyCharacter] = useState<DokkanCharacter | null>(null);
  const [allyCharacter, setAllyCharacter] = useState<DokkanCharacter | null>(null);

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

  const incomingResult = useMemo(
    () =>
      calculateDamage({
        baseAtk: enemyAtk,
        leaderSkillMultiplier: 1,
        passiveMultiplier: 1,
        otherAtkMultiplier: 1,
        kiMultiplier: 1,
        superAttackMultiplier: enemySuperAttackMultiplier,
        enemyDef: allyDef,
        enemyDamageReductionPercent: allyDamageReductionPercent,
        typeMatchup: incomingTypeMatchup,
        isCritical: enemyIsCritical,
      }),
    [
      enemyAtk,
      enemySuperAttackMultiplier,
      allyDef,
      allyDamageReductionPercent,
      incomingTypeMatchup,
      enemyIsCritical,
    ]
  );

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

        <CharacterManager characters={characters} />

        <h2 className="-mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          与ダメージ計算(自分の攻撃)
        </h2>
        <section className="grid grid-cols-1 gap-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 sm:grid-cols-2">
          <CharacterSelect
            label="キャラクター選択(自動入力)"
            characters={characters}
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
          <SourceAttributions characters={[attackerCharacter]} />
        </section>

        <h2 className="-mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          被ダメージ計算(敵からの攻撃)
        </h2>
        <section className="grid grid-cols-1 gap-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 sm:grid-cols-2">
          <CharacterSelect
            label="敵キャラクター選択(自動入力)"
            characters={characters}
            onSelect={(c) => {
              setEnemyAtk(c.baseAtk);
              setEnemySuperAttackMultiplier(c.superAttackMultiplier);
              setEnemyCharacter(c);
            }}
          />
          <CharacterSelect
            label="味方キャラクター選択(自動入力)"
            characters={characters}
            onSelect={(c) => {
              setAllyDef(c.baseDef);
              setAllyCharacter(c);
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
          <NumberField label="味方DEF" value={allyDef} onChange={setAllyDef} step="1" />
          <NumberField
            label="味方ダメージ軽減率(%)"
            value={allyDamageReductionPercent}
            onChange={setAllyDamageReductionPercent}
            hint="ガード・被ダメ軽減パッシブなど。無ければ0"
          />

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-800 dark:text-zinc-200">属性相性</span>
            <select
              value={incomingTypeMatchup}
              onChange={(e) => setIncomingTypeMatchup(e.target.value as TypeMatchup)}
              disabled={enemyIsCritical}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              {TYPE_MATCHUP_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              敵の属性が味方に対して有利/不利かで選択
            </span>
          </label>

          <label className="flex items-center gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200 sm:col-span-2">
            <input
              type="checkbox"
              checked={enemyIsCritical}
              onChange={(e) => setEnemyIsCritical(e.target.checked)}
              className="h-4 w-4"
            />
            敵が会心(クリティカル)を発生
            <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
              味方DEFを無視し、ダメージ倍率が固定1.875倍になります
            </span>
          </label>
        </section>

        <section className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">計算結果</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <dt>参照DEF(会心時は0)</dt>
            <dd className="text-right tabular-nums">
              {incomingResult.effectiveDef.toLocaleString()}
            </dd>
            <dt>ATK-DEF</dt>
            <dd className="text-right tabular-nums">
              {Math.floor(incomingResult.atkMinusDef).toLocaleString()}
            </dd>
            <dt>適用係数</dt>
            <dd className="text-right tabular-nums">×{incomingResult.coefficient}</dd>
          </dl>
          <div className="mt-2 flex items-baseline justify-between border-t border-zinc-200 pt-3 dark:border-zinc-800">
            <span className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              被ダメージ
            </span>
            <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">
              {incomingResult.damage.toLocaleString()}
            </span>
          </div>
          <SourceAttributions characters={[enemyCharacter, allyCharacter]} />
        </section>
      </main>
    </div>
  );
}
