import { Router } from "express";
import {
  updateProfile,
  me,
  getUserById,
  getTopCreators,
  exploreCreators,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/profile", authMiddleware, updateProfile);
router.get("/me", authMiddleware, me);
router.get("/creators/top", getTopCreators);
router.get("/creators", exploreCreators);

router.get("/:id", getUserById);
export default router;
