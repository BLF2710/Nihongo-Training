import { Router } from "express";
import {
  cancelRequest, getLeaderboard, getPublicProfile, listFriends, listNotifications, readNotifications, removeFriend, respondToRequest, sendRequest, streamEvents,
} from "../controllers/friend.controller";
import { authenticate } from "../middleware/auth.middleware";

// Mounted at /api. Friends, the leaderboard and public profiles can be switched off by an administrator ("friends" content key).
const router = Router();
router.use(["/friends", "/people", "/events", "/notifications"], authenticate);

router.get("/events", streamEvents);

router.get("/friends", listFriends);
router.get("/friends/leaderboard", getLeaderboard);
router.post("/friends/requests", sendRequest);
router.put("/friends/requests/:id", respondToRequest);
router.delete("/friends/requests/:id", cancelRequest);
router.delete("/friends/:username", removeFriend);

router.get("/people/:username", getPublicProfile);

// The notification centre (all signed-in accounts).
router.get("/notifications", listNotifications);
router.post("/notifications/read", readNotifications);

export default router;
