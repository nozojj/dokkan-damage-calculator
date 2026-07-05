import { prisma } from "./prisma";
import type { DokkanCharacter } from "./characters";
import type { Enemy } from "./enemies";
import type { Stage } from "./stages";
import type { LinkSkill } from "./linkSkills";
import type { SupportItem } from "./supportItems";
import type { Party } from "./party";
import type { CharacterDefaultArgs, CharacterGetPayload } from "../../generated/prisma-client/models";

const characterWithLinksArgs = {
  include: {
    linkSkills: true,
    supportItems: true,
    partyMembers: true,
  },
} satisfies CharacterDefaultArgs;

type CharacterWithLinks = CharacterGetPayload<typeof characterWithLinksArgs>;

function toDokkanCharacter(c: CharacterWithLinks): DokkanCharacter {
  return {
    id: c.id,
    name: c.name,
    type: c.type,
    rarity: c.rarity,
    class: c.class,
    baseAtk: c.baseAtk,
    baseDef: c.baseDef,
    kiMultiplier: c.kiMultiplier,
    superAttackMultiplier: c.superAttackMultiplier,
    leaderSkillMultiplier: c.leaderSkillMultiplier,
    sourceUrl: c.sourceUrl,
    linkSkillIds: c.linkSkills.map((l) => l.linkSkillId),
    supportItemIds: c.supportItems.map((s) => s.supportItemId),
    partyMemberIds: c.partyMembers.map((p) => p.memberId),
  };
}

export async function getCharacters(): Promise<DokkanCharacter[]> {
  const characters = await prisma.character.findMany({
    orderBy: { createdAt: "asc" },
    ...characterWithLinksArgs,
  });

  return characters.map(toDokkanCharacter);
}

export async function getParties(): Promise<Party[]> {
  const parties = await prisma.party.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      members: {
        orderBy: { slotIndex: "asc" },
        include: { character: characterWithLinksArgs },
      },
    },
  });

  return parties.map((p) => ({
    id: p.id,
    name: p.name,
    members: p.members.map((m) => ({
      slotIndex: m.slotIndex,
      character: toDokkanCharacter(m.character),
    })),
  }));
}

export async function getLinkSkills(): Promise<LinkSkill[]> {
  const linkSkills = await prisma.linkSkill.findMany({
    orderBy: { createdAt: "asc" },
  });

  return linkSkills.map((l) => ({
    id: l.id,
    name: l.name,
    description: l.description,
  }));
}

export async function getSupportItems(): Promise<SupportItem[]> {
  const supportItems = await prisma.supportItem.findMany({
    orderBy: { createdAt: "asc" },
  });

  return supportItems.map((s) => ({
    id: s.id,
    name: s.name,
    effect: s.effect,
  }));
}

export async function getEnemies(): Promise<Enemy[]> {
  const enemies = await prisma.enemy.findMany({
    orderBy: { createdAt: "asc" },
  });

  return enemies.map((e) => ({
    id: e.id,
    name: e.name,
    type: e.type,
    atk: e.atk,
    def: e.def,
    superAttackMultiplier: e.superAttackMultiplier,
    damageReductionPercent: e.damageReductionPercent,
    sourceUrl: e.sourceUrl,
  }));
}

export async function getStages(): Promise<Stage[]> {
  const stages = await prisma.stage.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      enemies: { orderBy: { waveOrder: "asc" } },
      mechanics: true,
    },
  });

  return stages.map((s) => ({
    id: s.id,
    name: s.name,
    event: s.event,
    difficulty: s.difficulty,
    enemyCount: s.enemyCount,
    sourceUrl: s.sourceUrl,
    enemies: s.enemies.map((se) => ({
      id: se.id,
      name: se.name,
      hp: Number(se.hp),
      atk: se.atk,
      def: se.def,
      type: se.type,
      superAttackMultiplier: se.superAttackMultiplier,
      guardReduction: se.guardReduction,
      waveOrder: se.waveOrder,
    })),
    mechanics: s.mechanics.map((m) => ({
      id: m.id,
      mechanic: m.mechanic,
    })),
  }));
}
