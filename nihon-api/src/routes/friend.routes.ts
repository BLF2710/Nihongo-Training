import { Router } from "express";
import { cancelRequest, getPublicProfile, listFriends, removeFriend, respondToRequest, sendRequest, streamEvents } from "../controllers/friend.controller";
import { authenticate } from "../middleware/auth.middleware";

// Mounted at /api. Friends and public profiles can be switched off by an administrator ("friends" content key).
const router = Router();
router.use(["/friends", "/people", "/events"], authenticate);

router.get("/events", streamEvents);

router.get("/friends", listFriends);
router.post("/friends/requests", sendRequest);
router.put("/friends/requests/:id", respondToRequest);
router.delete("/friends/requests/:id", cancelRequest);
router.delete("/friends/:username", removeFriend);

router.get("/people/:username", getPublicProfile);

export default router;
