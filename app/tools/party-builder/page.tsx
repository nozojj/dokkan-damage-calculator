import PartyBuilderClient from "./party-builder-client";
import { getCharacters, getLinkSkills, getParties } from "../../lib/data";

export default async function PartyBuilderPage() {
  const [characters, linkSkills, parties] = await Promise.all([
    getCharacters(),
    getLinkSkills(),
    getParties(),
  ]);

  return (
    <PartyBuilderClient characters={characters} linkSkills={linkSkills} parties={parties} />
  );
}
