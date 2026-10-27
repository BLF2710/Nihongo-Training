import * as activity from "../services/friend-activity.service";
import * as blocks from "../services/learner-block.service";
import * as challenges from "../services/friend-challenge.service";
import * as settings from "../services/social-settings.service";
import { getFriendSuggestions } from "../services/friend-suggestion.service";
import { action } from "../utils/action";
import { getUserId } from "../utils/request-user";

export const blockLearner = action(async (req, res) => res.json(await blocks.blockLearner(getUserId(req), req.params.username)),
  { label: "blockLearner", message: "Could not block this learner." });
export const reportLearner = action(async (req, res) => res.status(201).json(await blocks.reportLearner(getUserId(req), req.params.username, req.body?.reason)),
  { label: "reportLearner", message: "Could not send the report. Please try again." });
export const listBlocked = action(async (req, res) => res.json(await blocks.listBlocked(getUserId(req))),
  { label: "listBlocked", message: "Could not load your blocked learners." });
export const unblockLearner = action(async (req, res) => res.json(await blocks.unblockLearner(getUserId(req), req.params.username)),
  { label: "unblockLearner", message: "Could not unblock this learner." });

export const getSuggestions = action(async (req, res) => res.json(await getFriendSuggestions(getUserId(req))),
  { label: "friendSuggestions", message: "Could not load suggestions." });

export const getFeed = action(async (req, res) => res.json(await activity.getActivityFeed(getUserId(req))),
  { label: "friendActivity", message: "Could not load your friends' activity." });
export const cheer = action(async (req, res) => res.status(201).json(await activity.cheerFriend(getUserId(req), req.params.username, req.body?.item)),
  { label: "cheerFriend", message: "Could not send the cheer." });
export const nudge = action(async (req, res) => res.status(201).json(await activity.nudgeFriend(getUserId(req), req.params.username)),
  { label: "nudgeFriend", message: "Could not send the nudge." });

export const listChallenges = action(async (req, res) => res.json(await challenges.listChallenges(getUserId(req))),
  { label: "listChallenges", message: "Could not load your challenges." });
export const createChallenge = action(async (req, res) => res.status(201).json(await challenges.createChallenge(getUserId(req), req.body ?? {})),
  { label: "createChallenge", message: "Could not send the challenge." });
export const respondToChallenge = action(async (req, res) => res.json(await challenges.respondToChallenge(getUserId(req), req.params.id, req.body?.accept)),
  { label: "respondToChallenge", message: "Could not answer the challenge." });
export const cancelChallenge = action(async (req, res) => res.json(await challenges.cancelChallenge(getUserId(req), req.params.id)),
  { label: "cancelChallenge", message: "Could not cancel the challenge." });

export const getSocialSettings = action(async (req, res) => res.json(await settings.getSocialSettings(getUserId(req))),
  { label: "getSocialSettings", message: "Could not load your settings." });
export const updateSocialSettings = action(async (req, res) => res.json(await settings.updateSocialSettings(getUserId(req), req.body ?? {})),
  { label: "updateSocialSettings", message: "Could not save your settings." });
