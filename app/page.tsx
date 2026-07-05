import DokkanCalculator from "./dokkan-calculator";
import { getCharacters, getEnemies, getLinkSkills, getStages, getSupportItems } from "./lib/data";

export default async function Page() {
  const [characters, enemies, stages, linkSkills, supportItems] = await Promise.all([
    getCharacters(),
    getEnemies(),
    getStages(),
    getLinkSkills(),
    getSupportItems(),
  ]);
  return (
    <DokkanCalculator
      characters={characters}
      enemies={enemies}
      stages={stages}
      linkSkills={linkSkills}
      supportItems={supportItems}
    />
  );
}
