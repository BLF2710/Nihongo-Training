/** Particle Drop: fill the missing particle in a sentence from a finished lesson. Pure rules, no browser APIs. */

export type ExampleSentence = { japanese: string; romaji: string; meaning: string };
export type ParticleSource = { id: string; title: string; examples: ExampleSentence[] };
export type ParticleQuestion = {
  lessonId: string; lessonTitle: string;
  /** The sentence's phrases with the gap as `null`, e.g. ["とうきょう", null, " いま ごご くじです。"]. */
  parts: (string | null)[];
  answer: string; options: string[]; romaji: string; meaning: string;
};

/** The particles asked about, with their romaji as written in the course's example sentences. */
export const PARTICLES: Record<string, readonly string[]> = {
  は: ["wa"], が: ["ga"], を: ["o", "wo"], に: ["ni"], で: ["de"], へ: ["e"], と: ["to"], も: ["mo"], の: ["no"],
};
const PARTICLE_LIST = Object.keys(PARTICLES);
// Pairs that are both right in many sentences ("go to school" takes に or へ), so one is never a wrong choice for the other.
const INTERCHANGEABLE: Record<string, string> = { に: "へ", へ: "に" };
export const CHOICE_COUNT = 4;
/** No particle is asked more often than this in a round, unless the lessons offer too few other particles to fill it. */
export const MAX_SAME_PARTICLE = 3;
const SENTENCE_END = /[。！？!?」]+$/;

const toParticle = (token: string) => PARTICLE_LIST.find(particle => PARTICLES[particle].includes(token));

/** The particles the romaji writes as separate words, in order: "Toukyou wa ima..." → ["は"]. */
function romajiParticles(romaji: string): string[] {
  return romaji.toLowerCase().replace(/[.,!?"“”]/g, " ").split(/\s+/).flatMap(token => toParticle(token) ?? []);
}

type Gap = { phrase: number; particle: string };

/**
 * Where the sentence's particles are: at the end of a space-separated phrase. A gap counts only when the
 * phrase-final particles, read in order, are exactly the separate particle words of the romaji, so a は inside
 * a word (はし) or a sentence the two don't agree on never yields a question.
 */
export function findParticleGaps(example: ExampleSentence): Gap[] {
  const phrases = example.japanese.trim().split(/\s+/);
  const gaps: Gap[] = [];
  phrases.forEach((raw, phrase) => {
    const text = raw.replace(SENTENCE_END, "").replace(/、$/, "");
    // Up to two particles in a row (には, でも); a phrase that is only particles isn't a word with a particle.
    const trailing: string[] = [];
    for (let end = text.length; end > 0 && trailing.length < 2 && PARTICLES[text[end - 1]]; end--) trailing.unshift(text[end - 1]);
    if (trailing.length && trailing.length < text.length) gaps.push(...trailing.map(particle => ({ phrase, particle })));
  });
  const fromRomaji = romajiParticles(example.romaji);
  const agree = gaps.length === fromRomaji.length && gaps.every((gap, index) => gap.particle === fromRomaji[index]);
  // Only the last particle of a phrase can be blanked without also hiding the one before it.
  return agree ? gaps.filter((gap, index) => gaps[index + 1]?.phrase !== gap.phrase) : [];
}

/** The sentence split around one gap: the phrase loses its final particle, which becomes the blank. */
function splitAtGap(japanese: string, gap: Gap): (string | null)[] {
  const phrases = japanese.trim().split(/\s+/);
  const phrase = phrases[gap.phrase];
  const end = phrase.search(/[、。！？!?」]*$/);
  const before = [...phrases.slice(0, gap.phrase), phrase.slice(0, end - 1)].join(" ");
  const after = phrase.slice(end) + (gap.phrase < phrases.length - 1 ? " " + phrases.slice(gap.phrase + 1).join(" ") : "");
  return [before, null, ...(after ? [after] : [])];
}

/** The right particle and three others, never one that would also be right; `random` returns [0, 1). */
export function particleChoices(answer: string, random: () => number): string[] {
  const others = PARTICLE_LIST.filter(particle => particle !== answer && particle !== INTERCHANGEABLE[answer]);
  const picked = shuffle(others, random).slice(0, CHOICE_COUNT - 1);
  return shuffle([answer, ...picked], random);
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }
  return copy;
}

/** How often each particle can be a gap in these lessons. */
function countGaps(lessons: ParticleSource[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const gap of lessons.flatMap(lesson => lesson.examples.flatMap(findParticleGaps))) counts.set(gap.particle, (counts.get(gap.particle) ?? 0) + 1);
  return counts;
}

/** The gap with the least common particle (は is everywhere, を less so), so rarer particles get asked; ties at random. */
function pickGap(gaps: Gap[], counts: Map<string, number>, random: () => number): Gap {
  const rarest = Math.min(...gaps.map(gap => counts.get(gap.particle) ?? 0));
  const candidates = gaps.filter(gap => (counts.get(gap.particle) ?? 0) === rarest);
  return candidates[Math.floor(random() * candidates.length)];
}

/** Every question the given lessons can make: one per sentence, at its least common particle. */
export function allParticleQuestions(lessons: ParticleSource[], random: () => number): ParticleQuestion[] {
  const counts = countGaps(lessons);
  return lessons.flatMap(lesson => lesson.examples.flatMap(example => {
    const gaps = findParticleGaps(example);
    if (!gaps.length) return [];
    const gap = pickGap(gaps, counts, random);
    return [{
      lessonId: lesson.id, lessonTitle: lesson.title, parts: splitAtGap(example.japanese, gap), answer: gap.particle,
      options: particleChoices(gap.particle, random), romaji: example.romaji, meaning: example.meaning,
    }];
  }));
}

/**
 * A balanced round of up to `size` questions from different sentences, in random order: particles take turns (one
 * of each before any repeats), at most MAX_SAME_PARTICLE each. Only when the lessons have too few different particles
 * is the round topped up past that limit.
 */
export function buildParticleRound(lessons: ParticleSource[], size: number, random: () => number): ParticleQuestion[] {
  const questions = shuffle(allParticleQuestions(lessons, random), random);
  const byParticle = new Map<string, ParticleQuestion[]>();
  for (const question of questions) byParticle.set(question.answer, [...(byParticle.get(question.answer) ?? []), question]);
  const turns = shuffle([...byParticle.keys()], random);
  const round: ParticleQuestion[] = [];
  for (let turn = 0; turn < MAX_SAME_PARTICLE && round.length < size; turn++) {
    for (const particle of turns) {
      const next = byParticle.get(particle)?.[turn];
      if (next && round.length < size) round.push(next);
    }
  }
  const topUp = questions.filter(question => !round.includes(question)).slice(0, size - round.length);
  return shuffle([...round, ...topUp], random);
}

/** Points for a right answer: faster is better, and a streak of right answers adds a bonus. */
export function scoreAnswer(secondsLeft: number, streak: number): number {
  const BASE = 100, PER_SECOND = 10, PER_STREAK = 20, MAX_STREAK_BONUS = 100;
  return BASE + Math.max(0, Math.round(secondsLeft)) * PER_SECOND + Math.min(MAX_STREAK_BONUS, Math.max(0, streak - 1) * PER_STREAK);
}
