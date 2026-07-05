import DokkanCalculator from "./dokkan-calculator";
import { getCharacters, getEnemies, getStages } from "./lib/data";

export default async function Page() {
  const [characters, enemies, stages] = await Promise.all([
    getCharacters(),
    getEnemies(),
    getStages(),
  ]);
  return <DokkanCalculator characters={characters} enemies={enemies} stages={stages} />;
}
