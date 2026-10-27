import * as srsService from "../services/srs.service";
import { action } from "../utils/action";
import { getUserId } from "../utils/request-user";

export const getSrsSummary = action(async (req, res) => res.json(await srsService.getSummary(getUserId(req))),
  { label: "getSrsSummary", message: "Could not load your reviews." });

export const getSrsQueue = action(async (req, res) => res.json(await srsService.getQueue(getUserId(req))),
  { label: "getSrsQueue", message: "Could not load your reviews." });

export const enrollSrsItems = action(async (req, res) => res.json(await srsService.enrollItems(getUserId(req), req.body?.items)),
  { label: "enrollSrsItems", message: "Could not add the cards to your reviews." });

export const reviewSrsCard = action(async (req, res) => res.json(await srsService.reviewCard(getUserId(req), req.body ?? {})),
  { label: "reviewSrsCard", message: "Could not save the review. Please try again." });
