"use client";

import { useMemo, useState } from "react";
import { SearchableSelect } from "../../components/searchable-select";
import { TypeLabel } from "../../components/type-label";
import { createParty, deleteParty, updatePartyMembers } from "../../lib/actions";
import {
  characterTag,
  DOKKAN_CLASS_LABELS,
  DOKKAN_RARITY_LABELS,
  type DokkanCharacter,
} from "../../lib/characters";
import {
  PARTY_SLOT_COUNT,
  getActiveLinks,
  getComposedLeaderSkillMultiplier,
  type Party,
} from "../../lib/party";
import type { LinkSkill } from "../../lib/linkSkills";

const SLOT_LABELS = ["リーダー", "サブ2", "サブ3", "サブ4", "サブ5", "フレンド"];

function PartyEditor({
  party,
  characters,
  linkSkills,
}: {
  party: Party;
  characters: DokkanCharacter[];
  linkSkills: LinkSkill[];
}) {
  const [slotCharacters, setSlotCharacters] = useState<(DokkanCharacter | null)[]>(() => {
    const slots: (DokkanCharacter | null)[] = Array(PARTY_SLOT_COUNT).fill(null);
    for (const m of party.members) {
      slots[m.slotIndex] = m.character;
    }
    return slots;
  });

  const members = useMemo(
    () =>
      slotCharacters
        .map((character, slotIndex) => (character ? { slotIndex, character } : null))
        .filter((m): m is { slotIndex: number; character: DokkanCharacter } => m !== null),
    [slotCharacters]
  );

  const activeLinks = useMemo(() => getActiveLinks(members), [members]);
  const composedLeaderSkill = useMemo(() => getComposedLeaderSkillMultiplier(members), [members]);

  const linkedSlots = useMemo(() => {
    const set = new Set<number>();
    for (const link of activeLinks) {
      set.add(link.slotA);
      set.add(link.slotB);
    }
    return set;
  }, [activeLinks]);

  function linkNameFor(id: string) {
    return linkSkills.find((l) => l.id === id)?.name ?? id;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SLOT_LABELS.map((slotLabel, slotIndex) => {
          const slotCharacter = slotCharacters[slotIndex];
          return (
            <div
              key={slotIndex}
              className={`flex flex-col gap-2 rounded-md border p-3 ${
                linkedSlots.has(slotIndex)
                  ? "border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/30"
                  : "border-zinc-300 dark:border-zinc-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  {slotIndex}: {slotLabel}
                </span>
                {slotCharacter && (
                  <button
                    type="button"
                    onClick={() =>
                      setSlotCharacters((slots) => {
                        const next = [...slots];
                        next[slotIndex] = null;
                        return next;
                      })
                    }
                    className="text-xs text-zinc-500 underline hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
                  >
                    解除
                  </button>
                )}
              </div>
              {slotCharacter ? (
                <span className="text-sm text-zinc-800 dark:text-zinc-200">
                  [<TypeLabel type={slotCharacter.type} /> / {DOKKAN_RARITY_LABELS[slotCharacter.rarity]} /{" "}
                  {DOKKAN_CLASS_LABELS[slotCharacter.class]}] {slotCharacter.name}
                </span>
              ) : (
                <SearchableSelect
                  label=""
                  items={characters}
                  getKey={(c) => c.id}
                  getLabel={characterTag}
                  placeholder="キャラ名で検索"
                  onSelect={(c) =>
                    setSlotCharacters((slots) => {
                      const next = [...slots];
                      next[slotIndex] = c;
                      return next;
                    })
                  }
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
        <h3 className="mb-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200">発動リンク</h3>
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
      </div>

      <div className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
        <h3 className="mb-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          リーダースキル合成プレビュー(リーダー×フレンド)
        </h3>
        <p className="text-sm text-zinc-800 dark:text-zinc-200">
          {composedLeaderSkill != null
            ? `×${composedLeaderSkill.toFixed(2)}`
            : "未設定(リーダー・フレンド両方にリーダースキルATK倍率の登録が必要です)"}
        </p>
      </div>

      <form action={updatePartyMembers} className="flex">
        <input type="hidden" name="partyId" value={party.id} />
        {slotCharacters.map((c, i) => (
          <input key={i} type="hidden" name={`slot${i}`} value={c?.id ?? ""} />
        ))}
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          保存
        </button>
      </form>
    </div>
  );
}

export default function PartyBuilderClient({
  characters,
  linkSkills,
  parties,
}: {
  characters: DokkanCharacter[];
  linkSkills: LinkSkill[];
  parties: Party[];
}) {
  const [selectedPartyId, setSelectedPartyId] = useState("");
  const selectedParty = useMemo(
    () => parties.find((p) => p.id === selectedPartyId) ?? null,
    [parties, selectedPartyId]
  );

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-12 font-sans dark:bg-black sm:px-8">
      <main className="flex w-full max-w-2xl flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">パーティ編成</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            6スロット(0=リーダー〜5=フレンド枠)にキャラを割り当てます。隣接スロット同士で一致するリンクスキルは緑枠でハイライトされます。
          </p>
        </div>

        <section className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">パーティ管理</h2>

          <form key={parties.length} action={createParty} className="flex gap-2">
            <input
              type="text"
              name="name"
              required
              placeholder="パーティ名(例: 極ブロリー編成)"
              className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <button
              type="submit"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              追加
            </button>
          </form>

          {parties.length > 0 && (
            <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
              {parties.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <button
                    type="button"
                    onClick={() => setSelectedPartyId(p.id)}
                    className={
                      p.id === selectedPartyId
                        ? "text-left font-semibold text-zinc-900 dark:text-zinc-50"
                        : "text-left text-zinc-700 hover:underline dark:text-zinc-300"
                    }
                  >
                    {p.name}({p.members.length}/6)
                  </button>
                  <form action={deleteParty}>
                    <input type="hidden" name="id" value={p.id} />
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
          )}
        </section>

        {selectedParty ? (
          <section className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              編成: {selectedParty.name}
            </h2>
            <PartyEditor
              key={selectedParty.id}
              party={selectedParty}
              characters={characters}
              linkSkills={linkSkills}
            />
          </section>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            上の「パーティ管理」からパーティを選ぶと編成できます。
          </p>
        )}
      </main>
    </div>
  );
}
