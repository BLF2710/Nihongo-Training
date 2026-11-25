/** On a phone a long conversation is shown a few lines at a time, so the step fits one screen. */
export const LINES_PER_PHONE_PAGE = 4;

export type DialoguePage = { index: number; label: string };

/** The pages a conversation of `lineCount` lines splits into, each labelled with its line numbers ("Lines 5–7"). */
export function dialoguePagesOf(lineCount: number): DialoguePage[] {
  return Array.from({ length: Math.ceil(lineCount / LINES_PER_PHONE_PAGE) }, (_, index) => {
    const first = index * LINES_PER_PHONE_PAGE + 1, last = Math.min(lineCount, first + LINES_PER_PHONE_PAGE - 1);
    return { index, label: first === last ? `Line ${first}` : `Lines ${first}–${last}` };
  });
}

/** Which page a line (counted from 0) is on. */
export const dialoguePageOfLine = (lineIndex: number) => Math.floor(lineIndex / LINES_PER_PHONE_PAGE);
