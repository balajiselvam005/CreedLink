import express from "express";
import {
  login,
  logout,
  refresh,
  signup,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema, signupSchema } from "../validators/auth.validator.js";
import { authLimiter } from "../middlewares/ratelimit.middleware.js";

const router = express.Router();

router.post("/signup", authLimiter, validate(signupSchema), signup);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", authMiddleware, logout);

export default router;
