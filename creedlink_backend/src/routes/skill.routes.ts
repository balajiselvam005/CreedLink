import { Router } from "express";
import { addSkill, getSkills } from "../controllers/skill.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();
router.post("/", authMiddleware, addSkill);
router.get("/:id", getSkills);

export default router;
