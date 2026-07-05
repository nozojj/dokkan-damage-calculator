import DokkanCalculator from "./dokkan-calculator";
import { getCharacters } from "./lib/data";

export default async function Page() {
  const characters = await getCharacters();
  return <DokkanCalculator characters={characters} />;
}
