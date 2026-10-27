export type ChallengeOutcome = "won" | "lost" | "tied";

/** The result of a finished friend challenge for one side. */
export function challengeOutcome(myScore: number, theirScore: number): ChallengeOutcome {
  if (myScore === theirScore) return "tied";
  return myScore > theirScore ? "won" : "lost";
}
