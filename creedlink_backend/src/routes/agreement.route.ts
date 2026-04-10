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

router.get("/:agreementId", authMiddleware, getAgreementById);

router.post("/:agreementId/sign", authMiddleware, signAgreement);

router.get("/:agreementId/verify", authMiddleware, verifyAgreement);

router.post("/:agreementId/rate", authMiddleware, rateUser);

export default router;
