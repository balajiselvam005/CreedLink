import { Router } from "express";
import {
  createAgreement,
  getAgreements,
  signAgreement,
  getAgreementById,
  rateUser,
  verifyAgreement,
} from "../controllers/agreement.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, createAgreement);
router.get("/", authMiddleware, getAgreements);
router.get("/:id", authMiddleware, getAgreementById);
router.post("/:id/sign", authMiddleware, signAgreement);
router.get("/:id/verify", authMiddleware, verifyAgreement); 
router.post("/:id/rate", authMiddleware, rateUser);

export default router;
