import * as srsService from "../services/srs.service";
import { action } from "../utils/action";
import { getUserId } from "../utils/request-user";

export const getSrsSummary = action(async (req, res) => res.json(await srsService.getSummary(getUserId(req))),
  { label: "getSrsSummary", message: "Could not load your reviews." });

export const getSrsQueue = action(async (req, res) => res.json(await srsService.getQueue(getUserId(req), { ahead: req.query.ahead === "1" })),
  { label: "getSrsQueue", message: "Could not load your reviews." });

export const enrollSrsItems = action(async (req, res) => res.json(await srsService.enrollItems(getUserId(req), req.body?.items)),
  { label: "enrollSrsItems", message: "Could not add the cards to your reviews." });

export const reviewSrsCard = action(async (req, res) => res.json(await srsService.reviewCard(getUserId(req), req.body ?? {})),
  { label: "reviewSrsCard", message: "Could not save the review. Please try again." });

export const getSrsDeck = action(async (req, res) => res.json(await srsService.getDeck(getUserId(req))),
  { label: "getSrsDeck", message: "Could not load your deck." });

export const setSrsCardSuspended = action(async (req, res) => res.json(await srsService.setCardSuspended(getUserId(req), req.params.itemType, req.params.itemId, req.body?.suspended)),
  { label: "setSrsCardSuspended", message: "Could not change the card. Please try again." });
