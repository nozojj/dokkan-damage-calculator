import IncomingDamageClient from "./incoming-damage-client";
import { getEnemies, getLinkSkills, getParties } from "../../lib/data";

export default async function IncomingDamagePage() {
  const [enemies, parties, linkSkills] = await Promise.all([
    getEnemies(),
    getParties(),
    getLinkSkills(),
  ]);

  return <IncomingDamageClient enemies={enemies} parties={parties} linkSkills={linkSkills} />;
}
