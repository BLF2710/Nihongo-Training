import type { SpeakingTestService } from "../services/speaking/speaking-test.service";
import { action } from "../utils/action";
import { getUserId } from "../utils/request-user";

/** HTTP handlers for the speaking test; the service (and so Azure and the AI grader) is passed in. */
export function speakingTestHandlers(service: SpeakingTestService) {
  return {
    listTasks: action(async (req, res) => res.json(await service.listTasks(getUserId(req), req.query.level)),
      { label: "listSpeakingTasks", message: "Could not load the speaking test." }),
    listAttempts: action(async (req, res) => res.json(await service.listAttempts(getUserId(req), req.params.taskId)),
      { label: "listSpeakingAttempts", message: "Could not load your results." }),
    submitAnswer: action(async (req, res) => {
      const outcome = await service.submitAnswer(getUserId(req), req.params.taskId, req.body ?? {});
      return res.status(outcome.status === "graded" ? 201 : 200).json(outcome);
    }, { label: "submitSpeakingAnswer", message: "Your answer couldn't be graded. Please try again." }),
    getAttempt: action(async (req, res) => res.json(await service.getAttempt(getUserId(req), req.params.attemptId)),
      { label: "getSpeakingAttempt", message: "Could not load this result." }),
    reportAttempt: action(async (req, res) => res.status(201).json(await service.reportAttempt(getUserId(req), req.params.attemptId, req.body?.note)),
      { label: "reportSpeakingAttempt", message: "Could not send your report." }),
  };
}
