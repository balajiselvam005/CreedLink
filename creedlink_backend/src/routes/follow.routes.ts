import { Router } from "express";
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowStatus,
  listFollowers,
} from "../controllers/follow.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Follow / Unfollow
router.post("/", authMiddleware, followUser);
router.delete("/", authMiddleware, unfollowUser);

// Counts
router.get("/:userId/followers", getFollowers);
router.get("/:userId/following", getFollowing);

// Follow status (for current user)
router.get("/status/:userId", authMiddleware, checkFollowStatus);

// List followers
router.get("/:userId/list", listFollowers);

export default router;