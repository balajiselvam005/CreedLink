import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { uploadAvatar } from "../controllers/upload.controller.js";

const router = Router();

router.post("/avatar", authMiddleware, upload.single("avatar"), uploadAvatar);

export default router;
