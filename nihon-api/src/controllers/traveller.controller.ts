import * as travellerService from "../services/traveller.service";
import { action } from "../utils/action";
import { getUserId } from "../utils/request-user";

export const getTravellerLook = action(async (req, res) => res.json(await travellerService.getTravellerLook(getUserId(req))),
  { label: "Traveller look", message: "Could not load your traveller." });

export const saveTravellerLook = action(async (req, res) => res.json(await travellerService.saveTravellerLook(getUserId(req), req.body)),
  { label: "Traveller look save", message: "Could not save your traveller. You can safely retry." });
