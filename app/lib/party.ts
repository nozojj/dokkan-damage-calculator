import type { DokkanCharacter } from "./characters";

export const PARTY_SLOT_COUNT = 6;
export const FRIEND_SLOT_INDEX = 5;

export interface PartyMember {
  slotIndex: number;
  character: DokkanCharacter;
}

export interface Party {
  id: string;
  name: string;
  members: PartyMember[];
}

export interface ActiveLink {
  slotA: number;
  slotB: number;
  linkSkillId: string;
}

/** 隣接スロット(0-1, 1-2, ..., 4-5)同士で共有しているリンクスキルを判定する */
export function getActiveLinks(members: PartyMember[]): ActiveLink[] {
  const bySlot = new Map(members.map((m) => [m.slotIndex, m]));
  const active: ActiveLink[] = [];

  for (let slot = 0; slot < PARTY_SLOT_COUNT - 1; slot++) {
    const a = bySlot.get(slot);
    const b = bySlot.get(slot + 1);
    if (!a || !b) continue;

    for (const linkSkillId of a.character.linkSkillIds) {
      if (b.character.linkSkillIds.includes(linkSkillId)) {
        active.push({ slotA: slot, slotB: slot + 1, linkSkillId });
      }
    }
  }

  return active;
}

/** リーダー(slot0)とフレンド(slot5)のleaderSkillMultiplierを合成する。どちらか未設定ならnull */
export function getComposedLeaderSkillMultiplier(members: PartyMember[]): number | null {
  const leader = members.find((m) => m.slotIndex === 0)?.character;
  const friendLeader = members.find((m) => m.slotIndex === FRIEND_SLOT_INDEX)?.character;

  if (!leader?.leaderSkillMultiplier || !friendLeader?.leaderSkillMultiplier) return null;

  return leader.leaderSkillMultiplier * friendLeader.leaderSkillMultiplier;
}
