import seedrandom from "seedrandom";
import phonetic from "./phonetic";

/**
 * @param seed unique string - e.g. location: x,y,z
 */
export const randomizeName = (seed: string) => {
  const rng = seedrandom(seed);
  const n = rng();

  let wordCount: number;
  if (n > 0.8) {
    wordCount = 1;
  } else if (n > 0.3) {
    wordCount = 2;
  } else {
    wordCount = 3;
  }

  return Array.from(Array(wordCount))
    .map((_, idx) => randomSyllable(seed, idx, wordCount))
    .join(" ");
};

const randomSyllable = (seed: string, idx: number, wordCount: number) => {
  const rng = seedrandom(seed + idx);
  const n = rng();

  let syllables: number;
  if (wordCount === 1) {
    syllables = 2 + Math.floor(3 * n);
  } else {
    syllables = 1 + Math.floor(3 * n);
  }

  return phonetic({ seed: seed + idx, syllables });
};
