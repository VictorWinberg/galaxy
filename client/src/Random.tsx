import { useEffect } from "react";
import seedrandom from "seedrandom";
import phonetic from "./phonetic";

const Random = () => {
  useEffect(() => {
    console.log(randomizeName(0));
    console.log(randomizeName(1));
    console.log(randomizeName(2));
    console.log(randomizeName(3));
    console.log(randomizeName(4));
  }, []);

  const randomizeName = (seed: number) => {
    let wordCount = 0;
    let rng = seedrandom(String(seed));
    let n = rng();
    if (n > 0.8) {
      wordCount = 1;
    } else if (n > 0.4) {
      wordCount = 2;
    } else {
      wordCount = 3;
    }

    return Array.from(Array(wordCount))
      .map(() => randomSyllable(rng()))
      .join(" ");
  };

  const randomSyllable = (seed: number) => {
    let syllableCount = 0;
    let rng = seedrandom(String(seed));
    let n = rng();
    if (n > 0.8) {
      syllableCount = 3;
    } else if (n > 0.4) {
      syllableCount = 2;
    } else {
      syllableCount = 1;
    }

    return phonetic({ seed: String(n), syllables: syllableCount });
  };
  return <></>;
};

export default Random;
