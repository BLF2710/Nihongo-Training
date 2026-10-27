import * as mistakeService from "../services/mistake.service";
import { action } from "../utils/action";
import { getUserId } from "../utils/request-user";

export const getMistakes = action(async (req, res) => res.json(await mistakeService.getNotebook(getUserId(req), req.query.status)),
  { label: "getMistakes", message: "Could not load your mistakes." });

export const recordLessonMistakes = action(async (req, res) => res.status(201).json(await mistakeService.recordLessonAnswers(getUserId(req), req.params.lessonId, req.body?.answers)),
  { label: "recordLessonMistakes", message: "Could not save the lesson's answers." });

export const practiseMistake = action(async (req, res) => res.json(await mistakeService.practiseMistake(getUserId(req), req.params.mistakeId, req.body?.correct)),
  { label: "practiseMistake", message: "Could not save the answer. Please try again." });

export const deleteMistake = action(async (req, res) => res.json(await mistakeService.removeMistake(getUserId(req), req.params.mistakeId)),
  { label: "deleteMistake", message: "Could not remove the mistake." });
