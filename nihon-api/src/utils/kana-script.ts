export type KanaScript = "hiragana" | "katakana";

/** Hiragana unless katakana is requested explicitly. */
export const parseKanaScript = (value: unknown): KanaScript => value === "katakana" ? "katakana" : "hiragana";
