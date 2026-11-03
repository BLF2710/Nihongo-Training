import type { ReactElement } from "react";
import type { CharacterId, Mood } from "../../lib/cast";

// Drawn in the island map's style: flat washi colours with a sumi ink outline. Each is a head-and-shoulders portrait in a
// 64-unit box centred on the face, so it sits in a round frame.
const INK = "#2e2a26";
const ink = { stroke: INK, strokeWidth: 1.5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const thin = { ...ink, strokeWidth: 1 };
const COLOUR = {
  paper: "#fbf5ea", cream: "#e9d6b3", fox: "#e8843c", vermilion: "#c94f35", wood: "#8a6a4a", bark: "#4a3a2c",
  skin: "#f1d0b0", robe: "#4a5560", ochre: "#c98a3a", ai: "#2f5d8a", grey: "#b8b4aa", pigeon: "#a6b0be", neck: "#6d9c86",
  leaf: "#5c8e46", gold: "#d9a93a", blush: "#f08a8a", tanuki: "#a88a6c", tanukiBody: "#8a6f55", fur: "#b9a48a",
  monkeyFace: "#e98a7e", sparrow: "#9a5a3a", sea: "#4c90a3", steam: "#9fdcd2",
};

type FaceProps = {
  y: number; spread: number; mood: Mood;
  /** Where the mouth sits below the eyes; omitted for a beak or a beard. */
  mouthDrop?: number;
  /** Eyes on a dark mask are drawn light. */
  eyeColour?: string;
  /** Resting eyes closed (serene) rather than open. */
  isSerene?: boolean;
  hasBlush?: boolean;
};

/** Eyes, brows when worried, a mouth and blush: the part that shows the mood. */
function Face({ y, spread, mood, mouthDrop, eyeColour = INK, isSerene = false, hasBlush = true }: FaceProps) {
  const line = { stroke: eyeColour, strokeWidth: 1.5, strokeLinecap: "round" as const, fill: "none" };
  const eyes = mood === "happy"
    ? <path d={`M${-spread - 2.2},${y + 0.8} q2.2,-2.8 4.4,0 M${spread - 2.2},${y + 0.8} q2.2,-2.8 4.4,0`} {...line} />
    : mood === "calm" && isSerene
      ? <path d={`M${-spread - 2.2},${y} q2.2,1.8 4.4,0 M${spread - 2.2},${y} q2.2,1.8 4.4,0`} {...line} />
      : <><circle cx={-spread} cy={y} r="1.8" fill={eyeColour} /><circle cx={spread} cy={y} r="1.8" fill={eyeColour} /></>;
  const m = mouthDrop === undefined ? null : y + mouthDrop;
  return <g>
    {hasBlush && <><ellipse cx={-spread - 4} cy={y + 4} rx="2.6" ry="1.5" fill={COLOUR.blush} opacity="0.5" /><ellipse cx={spread + 4} cy={y + 4} rx="2.6" ry="1.5" fill={COLOUR.blush} opacity="0.5" /></>}
    {eyes}
    {mood === "worried" && <path d={`M${-spread - 2.6},${y - 4.6} l4.2,1.4 M${spread + 2.6},${y - 4.6} l-4.2,1.4`} {...line} />}
    {m !== null && (mood === "happy" ? <path d={`M-3,${m} q3,3.4 6,0`} {...thin} fill="none" />
      : mood === "calm" ? <path d={`M-2,${m} q2,1.3 4,0`} {...thin} fill="none" />
        : <path d={`M-2.6,${m + 1} q2.6,-2 5.2,0`} {...thin} fill="none" />)}
  </g>;
}

/** Shoulders filling the bottom of the frame. */
const shoulders = (fill: string, top = 12) => <path d={`M-20,34 Q-19,${top + 2} 0,${top} Q19,${top + 2} 20,34 Z`} fill={fill} {...ink} />;

/** Kon, the shrine fox, in the red bib of the fox statues at Inari shrines. */
function Kon({ mood }: { mood: Mood }) {
  return <>
    {shoulders(COLOUR.fox, 13)}
    <path d="M-8,34 Q-7,19 0,17 Q7,19 8,34 Z" fill={COLOUR.paper} />
    <path d="M-12,14 Q0,19 12,14 L0,28 Z" fill={COLOUR.vermilion} {...ink} />
    <path d="M-14,-8 L-16,-29 L-3,-15 Z M14,-8 L16,-29 L3,-15 Z" fill={COLOUR.fox} {...ink} />
    <path d="M-12.6,-11 L-14,-24.5 L-6,-15 Z M12.6,-11 L14,-24.5 L6,-15 Z" fill={COLOUR.bark} />
    <path d="M-16,-6 Q-16,-18 0,-18 Q16,-18 16,-6 Q16,6 0,13 Q-16,6 -16,-6 Z" fill={COLOUR.fox} {...ink} />
    <path d="M-15,-1 Q-8,2 0,1 Q8,2 15,-1 Q12,8 0,13 Q-12,8 -15,-1 Z" fill={COLOUR.paper} />
    <path d="M-16,-6 Q-16,-18 0,-18 Q16,-18 16,-6 Q16,6 0,13 Q-16,6 -16,-6 Z" fill="none" {...ink} />
    <path d="M-4,-14.5 q4,3 8,0" stroke={COLOUR.vermilion} strokeWidth="1.6" strokeLinecap="round" fill="none" />
    <ellipse cx="0" cy="4.2" rx="1.9" ry="1.3" fill={INK} />
    <Face y={-4} spread={6.5} mood={mood} mouthDrop={11} />
  </>;
}

/** Hakase, the professor owl, in round spectacles. */
function Hakase({ mood }: { mood: Mood }) {
  return <>
    {shoulders(COLOUR.wood, 9)}
    <path d="M-9,34 Q-10,17 0,15 Q10,17 9,34 Z" fill={COLOUR.cream} />
    <path d="M-5,21 l2.5,2 l2.5,-2 M0,21 l2.5,2 l2.5,-2 M-2.5,27 l2.5,2 l2.5,-2" stroke={COLOUR.wood} strokeWidth="1.1" fill="none" strokeLinecap="round" />
    <path d="M-14,-16 L-18,-28 L-7,-20 Z M14,-16 L18,-28 L7,-20 Z" fill={COLOUR.wood} {...ink} />
    <ellipse cx="0" cy="-5" rx="18" ry="16" fill={COLOUR.wood} {...ink} />
    <circle cx="-7" cy="-5" r="7.5" fill={COLOUR.cream} />
    <circle cx="7" cy="-5" r="7.5" fill={COLOUR.cream} />
    <Face y={-5} spread={7} mood={mood} hasBlush={false} />
    <circle cx="-7" cy="-5" r="5.4" fill="none" {...thin} strokeWidth="1.3" />
    <circle cx="7" cy="-5" r="5.4" fill="none" {...thin} strokeWidth="1.3" />
    <path d="M-1.6,-5.5 h3.2" {...thin} />
    <path d="M-2.4,1 L2.4,1 L0,6 Z" fill="#e2c98f" {...thin} />
  </>;
}

/** Tama, a calico cat with a bell on her collar. */
function Tama({ mood }: { mood: Mood }) {
  return <>
    {shoulders(COLOUR.paper, 12)}
    <path d="M-10,13.5 Q0,18.5 10,13.5" stroke={COLOUR.vermilion} strokeWidth="3" fill="none" strokeLinecap="round" />
    <circle cx="0" cy="19" r="2.8" fill={COLOUR.gold} {...thin} />
    <path d="M-15,-7 L-13,-26 L-3,-15 Z" fill={COLOUR.fox} {...ink} />
    <path d="M15,-7 L13,-26 L3,-15 Z" fill={COLOUR.bark} {...ink} />
    <ellipse cx="0" cy="-3" rx="16" ry="14" fill={COLOUR.paper} />
    <path d="M-15.7,-5 Q-14,-16 -4,-16.8 Q-6,-9 -12,-1 Z" fill={COLOUR.fox} />
    <path d="M5,-16.8 Q14,-15 15.8,-5 Q10,-7 6,-12 Z" fill={COLOUR.bark} />
    <ellipse cx="0" cy="-3" rx="16" ry="14" fill="none" {...ink} />
    <path d="M-9,3 l-8,-1.5 M-9,5.5 l-8,1 M9,3 l8,-1.5 M9,5.5 l8,1" stroke={INK} strokeWidth="0.8" strokeLinecap="round" />
    <path d="M-1.5,2 h3 l-1.5,1.8 Z" fill={COLOUR.blush} {...thin} strokeWidth="0.7" />
    <Face y={-3} spread={6.5} mood={mood} mouthDrop={8} />
  </>;
}

/** Pon, the festival tanuki, with the leaf tanuki wear to change shape. */
function Pon({ mood }: { mood: Mood }) {
  return <>
    {shoulders(COLOUR.tanukiBody, 11)}
    <path d="M-10,34 Q-10,19 0,17 Q10,19 10,34 Z" fill={COLOUR.cream} />
    <circle cx="-11" cy="-14" r="5" fill={COLOUR.bark} {...ink} />
    <circle cx="11" cy="-14" r="5" fill={COLOUR.bark} {...ink} />
    <ellipse cx="0" cy="-3" rx="16" ry="14" fill={COLOUR.tanuki} {...ink} />
    <ellipse cx="0" cy="4" rx="7.5" ry="5.5" fill={COLOUR.cream} />
    <ellipse cx="-6.5" cy="-3" rx="5" ry="4" fill={COLOUR.bark} transform="rotate(15 -6.5 -3)" />
    <ellipse cx="6.5" cy="-3" rx="5" ry="4" fill={COLOUR.bark} transform="rotate(-15 6.5 -3)" />
    <ellipse cx="0" cy="2" rx="2" ry="1.4" fill={INK} />
    <Face y={-3} spread={6.5} mood={mood} mouthDrop={9} eyeColour={COLOUR.paper} hasBlush={false} />
    <path d="M0,-16.5 Q4,-28 13,-26.5 Q10,-18 0,-16.5 Z" fill={COLOUR.leaf} {...thin} />
    <path d="M1.5,-17.5 Q6,-22 11,-25" stroke={INK} strokeWidth="0.7" fill="none" />
  </>;
}

/** Zen, the garden monk, with the rake for the gravel garden over his shoulder. */
function Zen({ mood }: { mood: Mood }) {
  return <>
    <path d="M-22,-19 L-12,22" stroke={COLOUR.wood} strokeWidth="2.6" strokeLinecap="round" />
    <path d="M-28,-20.5 L-16,-17.5" {...ink} strokeWidth="2" />
    <path d="M-26,-20 l-1,3 M-22.5,-19.2 l-1,3 M-19,-18.4 l-1,3" {...thin} />
    {shoulders(COLOUR.robe, 12)}
    <path d="M-12,14 L-4,13 L15,34 L5,34 Z" fill={COLOUR.ochre} {...thin} />
    <path d="M-6,12.5 L0,20 L6,12.5" stroke={COLOUR.paper} strokeWidth="2" fill="none" strokeLinejoin="round" />
    <ellipse cx="-14" cy="-3" rx="2.6" ry="4" fill={COLOUR.skin} {...thin} />
    <ellipse cx="14" cy="-3" rx="2.6" ry="4" fill={COLOUR.skin} {...thin} />
    <ellipse cx="0" cy="-4" rx="14" ry="15" fill={COLOUR.skin} {...ink} />
    <path d="M-7,-14.5 q3,-3 7,-3.2" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" fill="none" />
    <Face y={-3} spread={5.5} mood={mood} mouthDrop={7} isSerene />
  </>;
}

/** Tsuru, the red-crowned crane, with a calligraphy brush. */
function Tsuru({ mood }: { mood: Mood }) {
  return <>
    {shoulders(COLOUR.paper, 11)}
    <path d="M12,34 L23,6" stroke={COLOUR.wood} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M23,6 l2.6,-6 l-0.2,6.8 Z" fill={INK} />
    <path d="M-5,14 L-4.5,-1 Q0,-3 4.5,-1 L5,14 Q0,16.5 -5,14 Z" fill={INK} />
    <ellipse cx="0" cy="-8" rx="11" ry="10" fill={COLOUR.paper} {...ink} />
    <ellipse cx="0" cy="-16" rx="5" ry="2.8" fill={COLOUR.vermilion} />
    <Face y={-9} spread={5} mood={mood} hasBlush={false} />
    <path d="M-1.8,-5 L1.8,-5 L0,5 Z" fill="#c9b98a" {...thin} />
  </>;
}

/** Chun, a tree sparrow: brown cap, black cheek spots. */
function Chun({ mood }: { mood: Mood }) {
  return <>
    {shoulders(COLOUR.cream, 10)}
    <path d="M-20,34 Q-19,16 -11,13 Q-9,24 -6,34 Z M20,34 Q19,16 11,13 Q9,24 6,34 Z" fill={COLOUR.wood} {...thin} />
    <ellipse cx="0" cy="-4" rx="15" ry="13" fill={COLOUR.paper} {...ink} />
    <path d="M-15,-5 Q-15,-17 0,-17 Q15,-17 15,-5 Q8,-10 0,-10 Q-8,-10 -15,-5 Z" fill={COLOUR.sparrow} {...thin} />
    <ellipse cx="-10" cy="1.5" rx="2.6" ry="2" fill={INK} />
    <ellipse cx="10" cy="1.5" rx="2.6" ry="2" fill={INK} />
    <ellipse cx="0" cy="8" rx="3.6" ry="2.4" fill={INK} />
    <Face y={-3} spread={5.5} mood={mood} hasBlush={false} />
    <path d="M-2.2,1 L2.2,1 L0,4.6 Z" fill={COLOUR.bark} />
  </>;
}

/** Kurama, the tengu: red face, long nose, white beard and the small black cap of the mountain monks. */
function Kurama({ mood }: { mood: Mood }) {
  return <>
    {shoulders(COLOUR.paper, 11)}
    <path d="M-8,12 L0,22 L8,12" {...ink} fill="none" />
    <circle cx="-7" cy="21" r="3" fill={COLOUR.vermilion} {...thin} />
    <circle cx="7" cy="21" r="3" fill={COLOUR.vermilion} {...thin} />
    <circle cx="-8" cy="28.5" r="2.4" fill={COLOUR.vermilion} {...thin} />
    <circle cx="8" cy="28.5" r="2.4" fill={COLOUR.vermilion} {...thin} />
    <ellipse cx="0" cy="-4" rx="14" ry="14" fill={COLOUR.vermilion} {...ink} />
    <path d="M-12,2 Q-10,15 0,18 Q10,15 12,2 Q6,8.5 0,8.5 Q-6,8.5 -12,2 Z" fill="#f3eee4" {...thin} />
    <path d="M-4,-18.5 L4,-18.5 L6,-22.5 L0,-27 L-6,-22.5 Z" fill={INK} />
    <Face y={-5} spread={6} mood={mood} hasBlush={false} />
    {mood !== "worried" && <path d="M-11.5,-9.5 q4,-3.6 8,-1 M11.5,-9.5 q-4,-3.6 -8,-1" stroke="#f3eee4" strokeWidth="3" strokeLinecap="round" fill="none" />}
    <path d="M-2,-4 Q2,-5.4 4,-2 L12.5,7 Q12.6,9.2 10.4,8.6 L-1,2 Q-3,0 -2,-4 Z" fill="#d9663b" {...thin} strokeWidth="1.2" />
  </>;
}

/** Hato, the carrier pigeon, in a postman's cap with a satchel. */
function Hato({ mood }: { mood: Mood }) {
  return <>
    {shoulders(COLOUR.pigeon, 11)}
    <path d="M-12,14 Q0,20 12,14 L11,8 Q0,13 -11,8 Z" fill={COLOUR.neck} />
    <path d="M-15,15 L12,34" stroke={COLOUR.wood} strokeWidth="3" strokeLinecap="round" />
    <ellipse cx="0" cy="-4" rx="13" ry="12" fill={COLOUR.pigeon} {...ink} />
    <path d="M-10,-12 Q0,-21 10,-12 L10,-10 L-10,-10 Z" fill={COLOUR.ai} {...thin} />
    <path d="M-10,-10 L-14,-8.4 L-4,-8.4 Z" fill={INK} />
    <Face y={-3} spread={5.5} mood={mood} hasBlush={false} />
    <ellipse cx="0" cy="1" rx="2.5" ry="1.2" fill="#f3eee4" />
    <path d="M-2,1.6 L2,1.6 L0,6 Z" fill={COLOUR.bark} />
  </>;
}

/** Sensei of the tea house: grey hair in a bun with a hairpin, round glasses, and a cup of tea. */
function Sensei({ mood }: { mood: Mood }) {
  return <>
    <circle cx="0" cy="-20" r="6" fill={COLOUR.grey} {...ink} />
    <path d="M-9,-25 L9,-17" stroke={COLOUR.vermilion} strokeWidth="2" strokeLinecap="round" />
    <circle cx="9" cy="-17" r="1.7" fill={COLOUR.vermilion} />
    {shoulders(COLOUR.ai, 12)}
    <path d="M-7,12.5 L4,26 M7,12.5 L-1,19" stroke={COLOUR.paper} strokeWidth="2.4" strokeLinecap="round" />
    <ellipse cx="0" cy="-3" rx="13" ry="14" fill={COLOUR.skin} {...ink} />
    <path d="M-13,-4 Q-14,-17.5 0,-17.5 Q14,-17.5 13,-4 Q10,-12 0,-12 Q-10,-12 -13,-4 Z" fill={COLOUR.grey} {...thin} />
    <Face y={-2} spread={5.5} mood={mood} mouthDrop={7.5} />
    <circle cx="-5.5" cy="-2" r="4" fill="none" {...thin} />
    <circle cx="5.5" cy="-2" r="4" fill="none" {...thin} />
    <path d="M-1.5,-2.4 h3" {...thin} />
    <path d="M-7,26 h14 l-1.8,7 h-10.4 Z" fill={COLOUR.paper} {...thin} />
    <path d="M-1,23.5 q2,-2 0,-4 M3,23.5 q2,-2 0,-4" stroke={COLOUR.grey} strokeWidth="1" fill="none" strokeLinecap="round" />
  </>;
}

/** Momo, the snow monkey, with a folded towel on her head from the onsen. */
function Momo({ mood }: { mood: Mood }) {
  return <>
    {shoulders(COLOUR.fur, 11)}
    <path d="M-24,-6 q-2,-3 0,-6 q2,-3 0,-6 M24,-4 q2,-3 0,-6 q-2,-3 0,-6" stroke={COLOUR.steam} strokeWidth="1.6" fill="none" strokeLinecap="round" />
    <circle cx="-15" cy="-3" r="3" fill={COLOUR.monkeyFace} {...thin} />
    <circle cx="15" cy="-3" r="3" fill={COLOUR.monkeyFace} {...thin} />
    <ellipse cx="0" cy="-3" rx="15" ry="15" fill={COLOUR.fur} {...ink} />
    <path d="M0,-9 Q-4,-14 -9,-11 Q-13,-6 -9,1 Q-5,8 0,9 Q5,8 9,1 Q13,-6 9,-11 Q4,-14 0,-9 Z" fill={COLOUR.monkeyFace} {...thin} />
    <path d="M-9,-20 L9,-20 L10,-15.5 L-10,-15.5 Z" fill={COLOUR.paper} {...thin} />
    <path d="M-9.5,-17.8 h19" stroke={COLOUR.sea} strokeWidth="1.2" />
    <Face y={-3} spread={4.5} mood={mood} mouthDrop={7} hasBlush={false} />
  </>;
}

const PORTRAITS: Record<CharacterId, (props: { mood: Mood }) => ReactElement> = {
  kon: Kon, hakase: Hakase, tama: Tama, pon: Pon, zen: Zen, tsuru: Tsuru, chun: Chun, kurama: Kurama, hato: Hato, sensei: Sensei, momo: Momo,
};

/** A character's portrait in the given mood, filling its container. */
export function CharacterArt({ character, mood }: { character: CharacterId; mood: Mood }) {
  const Portrait = PORTRAITS[character];
  return <svg viewBox="-32 -32 64 64" className="block size-full" aria-hidden="true"><Portrait mood={mood} /></svg>;
}
