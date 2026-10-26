// Speaking test criteria and weights for each task type (GRADING.md section 6).

export type SpeakingTaskKind = "production" | "interaction" | "read_aloud";
export type ContentCriterionId = "task" | "coherence" | "vocabulary" | "grammar";
export type DeliveryCriterionId = "pronunciation" | "fluency" | "completeness" | "recognised";
export type SpeakingCriterionId = ContentCriterionId | DeliveryCriterionId;
export type CriterionSource = "ai" | "azure" | "browser";

export const SPEAKING_CRITERIA: Record<SpeakingCriterionId, { name: string; japanese: string; source: CriterionSource }> = {
  task: { name: "Task achievement", japanese: "課題達成", source: "ai" },
  coherence: { name: "Coherence", japanese: "まとまり", source: "ai" },
  vocabulary: { name: "Vocabulary", japanese: "語彙", source: "ai" },
  grammar: { name: "Grammar", japanese: "文法", source: "ai" },
  pronunciation: { name: "Pronunciation", japanese: "発音", source: "azure" },
  fluency: { name: "Fluency", japanese: "流暢さ", source: "azure" },
  completeness: { name: "Completeness", japanese: "完全さ", source: "azure" },
  recognised: { name: "Recognised accuracy", japanese: "認識の正確さ", source: "browser" },
};

export const CONTENT_CRITERIA: readonly ContentCriterionId[] = ["task", "coherence", "vocabulary", "grammar"];

type Weighted = { id: SpeakingCriterionId; weight: number };

/** Content 60 % (AI), delivery 40 % (Azure), for answers in the learner's own words. */
const FREE_ANSWER: readonly Weighted[] = [
  { id: "task", weight: 20 }, { id: "coherence", weight: 10 }, { id: "vocabulary", weight: 15 }, { id: "grammar", weight: 15 },
  { id: "pronunciation", weight: 20 }, { id: "fluency", weight: 20 },
];
const READ_ALOUD_WITH_AZURE: readonly Weighted[] = [{ id: "pronunciation", weight: 50 }, { id: "fluency", weight: 30 }, { id: "completeness", weight: 20 }];
/** Without Azure a read-aloud can only be compared with the passage through the browser's transcript. */
const READ_ALOUD_WITH_BROWSER: readonly Weighted[] = [{ id: "recognised", weight: 100 }];

/** Where the transcript and delivery scores come from: Azure pronunciation assessment, or only the browser's recogniser. */
export type DeliverySource = "azure" | "browser";

export function criteriaFor(kind: SpeakingTaskKind, delivery: DeliverySource): readonly Weighted[] {
  if (kind !== "read_aloud") return FREE_ANSWER;
  return delivery === "azure" ? READ_ALOUD_WITH_AZURE : READ_ALOUD_WITH_BROWSER;
}
