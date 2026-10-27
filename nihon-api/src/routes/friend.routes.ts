import { Router } from "express";
import {
  cancelRequest, getLeaderboard, getPublicProfile, listFriends, listNotifications, readNotifications, removeFriend, respondToRequest, sendRequest, streamEvents,
} from "../controllers/friend.controller";
import {
  blockLearner, cancelChallenge, cheer, createChallenge, getFeed, getSuggestions, listBlocked, listChallenges, nudge, reportLearner, respondToChallenge, unblockLearner,
} from "../controllers/social.controller";
import { authenticate } from "../middleware/auth.middleware";

// Mounted at /api. Friends, the leaderboard and public profiles can be switched off by an administrator ("friends" content key).
const router = Router();
router.use(["/friends", "/people", "/events", "/notifications", "/blocks"], authenticate);

router.get("/events", streamEvents);

router.get("/friends", listFriends);
router.get("/friends/leaderboard", getLeaderboard);
router.get("/friends/suggestions", getSuggestions);
router.get("/friends/activity", getFeed);
router.get("/friends/challenges", listChallenges);
router.post("/friends/challenges", createChallenge);
router.put("/friends/challenges/:id", respondToChallenge);
router.delete("/friends/challenges/:id", cancelChallenge);
router.post("/friends/requests", sendRequest);
router.put("/friends/requests/:id", respondToRequest);
router.delete("/friends/requests/:id", cancelRequest);
router.delete("/friends/:username", removeFriend);
router.post("/friends/:username/nudge", nudge);
router.post("/friends/:username/cheers", cheer);

router.get("/people/:username", getPublicProfile);
router.put("/people/:username/block", blockLearner);
router.post("/people/:username/report", reportLearner);

// Blocked learners (also blocked from Messages). Not part of the "friends" content switch.
router.get("/blocks", listBlocked);
router.delete("/blocks/:username", unblockLearner);

// The notification centre (all signed-in accounts).
router.get("/notifications", listNotifications);
router.post("/notifications/read", readNotifications);

export default router;
