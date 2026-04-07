import { Router } from "express";
import { getWorks } from "../controllers/work.controller.js";

const router = Router();

// router.put("")
router.get("/:id", getWorks);

export default router;
