import * as kanaWildsService from "../services/kana-wilds.service";
import { action } from "../utils/action";
import { getUserId } from "../utils/request-user";

export const getCollection = action(async (req, res) => res.json(await kanaWildsService.getCollection(getUserId(req))),
  { label: "Kana Wilds collection", message: "Could not load your kana collection." });

export const chooseStarter = action(async (req, res) => res.status(201).json(await kanaWildsService.chooseStarter(getUserId(req), req.body?.starter)),
  { label: "Kana Wilds starter", message: "Could not save your starter kana. You can safely retry." });

export const catchKana = action(async (req, res) => res.json(await kanaWildsService.catchKana(getUserId(req), req.body?.kanaId)),
  { label: "Kana Wilds catch", message: "Could not save the catch. You can safely retry." });
