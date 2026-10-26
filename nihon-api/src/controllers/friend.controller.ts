import * as friends from "../services/friend.service";
import * as notifications from "../services/notification.service";
import { openStream } from "../services/realtime.service";
import { action } from "../utils/action";
import { getUserId } from "../utils/request-user";

export const listFriends = action(async (req, res) => res.json(await friends.listFriends(getUserId(req))),
  { label: "listFriends", message: "Could not load your friends." });

export const sendRequest = action(async (req, res) => res.status(201).json(await friends.sendFriendRequest(getUserId(req), req.body?.username)),
  { label: "sendFriendRequest", message: "Could not send the friend request." });

export const respondToRequest = action(async (req, res) => res.json(await friends.respondToFriendRequest(getUserId(req), req.params.id, req.body?.accept)),
  { label: "respondToFriendRequest", message: "Could not answer the friend request." });

export const cancelRequest = action(async (req, res) => res.json(await friends.cancelFriendRequest(getUserId(req), req.params.id)),
  { label: "cancelFriendRequest", message: "Could not cancel the friend request." });

export const removeFriend = action(async (req, res) => res.json(await friends.removeFriend(getUserId(req), req.params.username)),
  { label: "removeFriend", message: "Could not remove this friend." });

export const getLeaderboard = action(async (req, res) => res.json(await friends.getLeaderboard(getUserId(req))),
  { label: "getLeaderboard", message: "Could not load the leaderboard." });

export const listNotifications = action(async (req, res) => res.json(await notifications.getNotifications(getUserId(req), req.query)),
  { label: "listNotifications", message: "Could not load your notifications." });

export const readNotifications = action(async (req, res) => res.json(await notifications.readNotifications(getUserId(req), req.body?.ids)),
  { label: "readNotifications", message: "Could not update your notifications." });

export const getPublicProfile = action(async (req, res) => res.json(await friends.getPublicProfile(getUserId(req), req.params.username)),
  { label: "getPublicProfile", message: "Could not load this profile." });

/** Live updates (server-sent events) for the signed-in learner's open tab. */
export const streamEvents = action(async (req, res) => {
  openStream(getUserId(req), res, listener => req.on("close", listener));
}, { label: "streamEvents", message: "Live updates are unavailable." });
