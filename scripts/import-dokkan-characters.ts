import { PrismaClient } from "../generated/prisma-client/client";
import { PrismaPg } from "@prisma/adapter-pg";

const DATA_URL =
  "https://raw.githubusercontent.com/MNprojects/DokkanAPI/main/data/DokkanCharacterData.json";

// April Fools / sellable-item novelty entries scraped alongside real cards on the wiki - not playable characters
const EXCLUDED_IDS = new Set(["11378", "11148"]);

// Source data is a scrape of the Dragon Ball Z Dokkan Battle Wiki (Fandom, CC BY-SA 3.0).
// Every imported row carries a sourceUrl back to the wiki page for attribution.
interface SourceCharacter {
  id: string;
  name: string;
  title: string;
  rarity: "UR" | "LR";
  class?: "Super" | "Extreme";
  type: "STR" | "AGL" | "TEQ" | "INT" | "PHY";
  rainbowAttack: number | null;
  freeDupeAttack: number | null;
  maxLevelAttack: number | null;
  rainbowDefence: number | null;
  freeDupeDefence: number | null;
  maxDefence: number | null;
  kiMultiplier: string;
}

// Source data has no numeric Super Attack % field, only flavor text ("causes colossal damage" etc.)
// that can't be reliably converted to a multiplier without risking wrong damage numbers.
// Every imported character gets this placeholder and should be corrected per-card before relying on it.
const PLACEHOLDER_SUPER_ATTACK_MULTIPLIER = 1;

function toWikiUrl(name: string, title: string): string {
  const pageTitle = title ? `${name} (${title})` : name;
  return `https://dbz-dokkanbattle.fandom.com/wiki/${encodeURIComponent(
    pageTitle.replace(/ /g, "_")
  )}`;
}

// e.g. "12 Ki Multiplier is 150%; 24 Ki Multiplier is 200%; ..." -> 2.0 (the highest Ki-bar multiplier)
function parseKiMultiplier(text: string): number | null {
  const matches = [...text.matchAll(/(\d+)\s*Ki Multiplier is\s+(?:is\s+)?(\d+)%/gi)];
  if (matches.length === 0) return null;
  const maxPercent = Math.max(...matches.map((m) => Number(m[2])));
  return maxPercent / 100;
}

function pickStat(...stats: (number | null)[]): number | null {
  return stats.find((s) => s != null) ?? null;
}

async function main() {
  console.log(`Fetching character data from ${DATA_URL} ...`);
  const res = await fetch(DATA_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch source data: ${res.status} ${res.statusText}`);
  }
  const records: SourceCharacter[] = await res.json();
  console.log(`Fetched ${records.length} records.`);

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  let imported = 0;
  let skipped = 0;

  for (const r of records) {
    if (EXCLUDED_IDS.has(r.id)) {
      skipped++;
      continue;
    }
    if (r.rarity !== "UR" && r.rarity !== "LR") {
      skipped++;
      continue;
    }
    if (!r.class) {
      console.warn(`skip (no class): ${r.name} (${r.id})`);
      skipped++;
      continue;
    }

    const baseAtk = pickStat(r.rainbowAttack, r.freeDupeAttack, r.maxLevelAttack);
    const baseDef = pickStat(r.rainbowDefence, r.freeDupeDefence, r.maxDefence);
    if (baseAtk == null || baseDef == null) {
      console.warn(`skip (no stats): ${r.name} (${r.id})`);
      skipped++;
      continue;
    }

    const kiMultiplier = parseKiMultiplier(r.kiMultiplier);
    if (kiMultiplier == null) {
      console.warn(`skip (unparseable kiMultiplier): ${r.name} (${r.id})`);
      skipped++;
      continue;
    }

    const data = {
      name: `${r.name} (${r.title})`,
      type: r.type,
      rarity: r.rarity,
      class: (r.class === "Super" ? "SUPER" : "EXTREME") as "SUPER" | "EXTREME",
      baseAtk: Math.round(baseAtk),
      baseDef: Math.round(baseDef),
      kiMultiplier,
      sourceUrl: toWikiUrl(r.name, r.title),
    };

    await prisma.character.upsert({
      where: { externalId: r.id },
      create: { ...data, externalId: r.id, superAttackMultiplier: PLACEHOLDER_SUPER_ATTACK_MULTIPLIER },
      update: data,
    });
    imported++;
  }

  console.log(`Done. imported/updated: ${imported}, skipped: ${skipped}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
