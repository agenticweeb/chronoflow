import { FranchiseDNA } from '@/lib/dna';

// Pre-computed DNA profiles for our static SEO franchises.
// This allows the recommendation engine to calculate Cosine Similarity instantly.
export const FRANCHISE_DNA_PROFILES: Record<string, { name: string; slug: string; dna: FranchiseDNA }> = {
  "fate-series": { name: "Fate Series", slug: "fate-series", dna: { nonLinearity: 9, entryClarity: 2, density: 5, sequelDepth: 8, branchFactor: 9, computedAt: "" } },
  "monogatari-series": { name: "Monogatari Series", slug: "monogatari-series", dna: { nonLinearity: 10, entryClarity: 3, density: 6, sequelDepth: 7, branchFactor: 5, computedAt: "" } },
  "steins-gate": { name: "Steins;Gate", slug: "steins-gate", dna: { nonLinearity: 8, entryClarity: 4, density: 8, sequelDepth: 4, branchFactor: 3, computedAt: "" } },
  "toaru-series": { name: "Toaru Series", slug: "toaru-series", dna: { nonLinearity: 7, entryClarity: 3, density: 7, sequelDepth: 6, branchFactor: 4, computedAt: "" } },
  "neon-genesis-evangelion": { name: "Neon Genesis Evangelion", slug: "neon-genesis-evangelion", dna: { nonLinearity: 9, entryClarity: 2, density: 6, sequelDepth: 5, branchFactor: 4, computedAt: "" } },
  "haruhi-suzumiya": { name: "The Melancholy of Haruhi Suzumiya", slug: "haruhi-suzumiya", dna: { nonLinearity: 10, entryClarity: 2, density: 5, sequelDepth: 4, branchFactor: 2, computedAt: "" } },
  "dragon-ball": { name: "Dragon Ball", slug: "dragon-ball", dna: { nonLinearity: 2, entryClarity: 8, density: 4, sequelDepth: 10, branchFactor: 6, computedAt: "" } },
  "code-geass": { name: "Code Geass", slug: "code-geass", dna: { nonLinearity: 6, entryClarity: 6, density: 8, sequelDepth: 4, branchFactor: 3, computedAt: "" } },
  "naruto": { name: "Naruto", slug: "naruto", dna: { nonLinearity: 2, entryClarity: 8, density: 3, sequelDepth: 10, branchFactor: 7, computedAt: "" } },
  "gundam-uc": { name: "Gundam Universal Century", slug: "gundam-uc", dna: { nonLinearity: 5, entryClarity: 3, density: 6, sequelDepth: 10, branchFactor: 8, computedAt: "" } },
  "jojo-bizarre-adventure": { name: "JoJo's Bizarre Adventure", slug: "jojo-bizarre-adventure", dna: { nonLinearity: 4, entryClarity: 8, density: 7, sequelDepth: 8, branchFactor: 7, computedAt: "" } },
  "one-piece": { name: "One Piece", slug: "one-piece", dna: { nonLinearity: 2, entryClarity: 9, density: 5, sequelDepth: 10, branchFactor: 4, computedAt: "" } },
  "bleach": { name: "Bleach", slug: "bleach", dna: { nonLinearity: 2, entryClarity: 8, density: 4, sequelDepth: 9, branchFactor: 6, computedAt: "" } },
  "baccano": { name: "Baccano!", slug: "baccano", dna: { nonLinearity: 10, entryClarity: 2, density: 7, sequelDepth: 3, branchFactor: 4, computedAt: "" } },
  "danganronpa": { name: "Danganronpa", slug: "danganronpa", dna: { nonLinearity: 8, entryClarity: 4, density: 6, sequelDepth: 4, branchFactor: 3, computedAt: "" } },
  "clannad": { name: "Clannad", slug: "clannad", dna: { nonLinearity: 7, entryClarity: 4, density: 8, sequelDepth: 4, branchFactor: 3, computedAt: "" } },
  "haikyu": { name: "Haikyu!!", slug: "haikyu", dna: { nonLinearity: 1, entryClarity: 9, density: 9, sequelDepth: 7, branchFactor: 1, computedAt: "" } },
  "attack-on-titan": { name: "Attack on Titan", slug: "attack-on-titan", dna: { nonLinearity: 3, entryClarity: 8, density: 8, sequelDepth: 7, branchFactor: 2, computedAt: "" } },
  "demon-slayer": { name: "Demon Slayer", slug: "demon-slayer", dna: { nonLinearity: 2, entryClarity: 9, density: 8, sequelDepth: 5, branchFactor: 2, computedAt: "" } },
  "fullmetal-alchemist": { name: "Fullmetal Alchemist: Brotherhood", slug: "fullmetal-alchemist", dna: { nonLinearity: 4, entryClarity: 7, density: 9, sequelDepth: 6, branchFactor: 2, computedAt: "" } },
  "death-note": { name: "Death Note", slug: "death-note", dna: { nonLinearity: 1, entryClarity: 10, density: 9, sequelDepth: 2, branchFactor: 1, computedAt: "" } },
  "jujutsu-kaisen": { name: "Jujutsu Kaisen", slug: "jujutsu-kaisen", dna: { nonLinearity: 2, entryClarity: 9, density: 8, sequelDepth: 5, branchFactor: 2, computedAt: "" } },
  "sword-art-online": { name: "Sword Art Online", slug: "sword-art-online", dna: { nonLinearity: 4, entryClarity: 7, density: 6, sequelDepth: 6, branchFactor: 4, computedAt: "" } },
  "hunter-x-hunter": { name: "Hunter x Hunter", slug: "hunter-x-hunter", dna: { nonLinearity: 3, entryClarity: 8, density: 7, sequelDepth: 7, branchFactor: 3, computedAt: "" } },
  "cyberpunk-edgerunners": { name: "Cyberpunk: Edgerunners", slug: "cyberpunk-edgerunners", dna: { nonLinearity: 1, entryClarity: 10, density: 10, sequelDepth: 1, branchFactor: 1, computedAt: "" } },
  "chainsaw-man": { name: "Chainsaw Man", slug: "chainsaw-man", dna: { nonLinearity: 2, entryClarity: 9, density: 8, sequelDepth: 3, branchFactor: 2, computedAt: "" } },
  "vinland-saga": { name: "Vinland Saga", slug: "vinland-saga", dna: { nonLinearity: 3, entryClarity: 8, density: 8, sequelDepth: 5, branchFactor: 2, computedAt: "" } },
  "one-punch-man": { name: "One Punch Man", slug: "one-punch-man", dna: { nonLinearity: 2, entryClarity: 9, density: 7, sequelDepth: 3, branchFactor: 2, computedAt: "" } },
  "ghost-in-the-shell": { name: "Ghost in the Shell", slug: "ghost-in-the-shell", dna: { nonLinearity: 6, entryClarity: 4, density: 6, sequelDepth: 5, branchFactor: 3, computedAt: "" } },
  "horimiya": { name: "Horimiya", slug: "horimiya", dna: { nonLinearity: 2, entryClarity: 8, density: 7, sequelDepth: 3, branchFactor: 1, computedAt: "" } }
};
