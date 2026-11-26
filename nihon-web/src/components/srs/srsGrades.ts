import type { SrsGrade } from "../../api/srs";

/** The four answers to "how well did you remember it?", in key order (1–4), shared by every flashcard review. */
export const SRS_GRADES: readonly { grade: SrsGrade; label: string; hint: string; tone: string }[] = [
  { grade: "again", label: "Again", hint: "Forgot it", tone: "border-red-200 bg-red-50 text-red-900 hover:bg-red-100" },
  { grade: "hard", label: "Hard", hint: "Remembered with effort", tone: "border-amber-200 bg-amber-50 text-amber-950 hover:bg-amber-100" },
  { grade: "good", label: "Good", hint: "Remembered", tone: "border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100" },
  { grade: "easy", label: "Easy", hint: "Knew it at once", tone: "border-sky-200 bg-sky-50 text-sky-950 hover:bg-sky-100" },
];
