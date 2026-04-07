import { Router } from "express";
import { getSkills } from "../controllers/skill.controller.js";

const router = Router();

// router.put("")
router.get("/:id", getSkills);

export default router;
