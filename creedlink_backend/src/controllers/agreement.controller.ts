import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { generateAgreementHash } from "../utils/hash.js";
import { generateAgreementNumber } from "../utils/agreementNumber.js";
import { error } from "node:console";

export const createAgreement = async (req: Request, res: Response) => {
  try {
    const { title, content, receiverEmail, signature } = req.body;

    const senderId = (req as any).userId;

    if (!senderId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!title || !content || !receiverEmail) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const receiver = await prisma.user.findUnique({
      where: { email: receiverEmail },
    });

    if (!receiver) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    // 🔥 FIX: prevent self agreement
    if (receiver.id === senderId) {
      return res.status(400).json({
        error: "You cannot create agreement with yourself",
      });
    }

    const agreementNumber = await generateAgreementNumber();

    const hash = generateAgreementHash(
      title,
      content,
      senderId,
      receiver.id
    );

    const agreement = await prisma.agreement.create({
      data: {
        agreementNumber,
        title,
        content,
        senderId,
        receiverId: receiver.id,
        hash,
        senderSigned: !!signature,
        senderSignature: signature || null,
        senderSignedAt: signature ? new Date() : null,
        status: signature ? "SENT" : "DRAFT",
      },
    });

    res.json(agreement);
  } catch (error: any) {
    console.error("CREATE AGREEMENT ERROR:", error);
    res.status(500).json({
      error: error.message || "Failed to create agreement",
    });
  }
};

export const getAgreements = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const agreements = await prisma.agreement.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: true,
        receiver: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(agreements);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch agreements" });
  }
};

export const getAgreementById = async (req: Request, res: Response) => {
  try {
    const agreementId = req.params.agreementId as string;
    const userId = (req as any).userId;

    const agreement = await prisma.agreement.findUnique({
      where: { id: agreementId },
      include: {
        sender: true,
        receiver: true,
      },
    });

    if (!agreement) {
      return res.status(404).json({ error: "Agreement not found" });
    }

    if (
      agreement.senderId !== userId &&
      agreement.receiverId !== userId
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json(agreement);
  } catch (error) {
    res.status(500).json({ error: "Agreement not found" });
  }
};

export const signAgreement = async (req: Request, res: Response) => {
  try {
    const agreementId = req.params.agreementId as string;
    const userId = (req as any).userId;
    const { signature } = req.body;

    const agreement = await prisma.agreement.findUnique({
      where: { id: agreementId },
    });

    if (!agreement) {
      return res.status(404).json({ error: "Agreement not found" });
    }

    // 🔐 ONLY RECEIVER CAN SIGN
    if (agreement.receiverId !== userId) {
      return res.status(403).json({ error: "Only receiver can sign" });
    }

    // ❌ Prevent double signing
    if (agreement.receiverSigned) {
      return res.status(400).json({ error: "Already signed" });
    }

    const updated = await prisma.agreement.update({
      where: { id: agreementId },
      data: {
        receiverSignature: signature,
        receiverSigned: true,
        receiverSignedAt: new Date(),
        status: "COMPLETED",
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to sign agreement" });
  }
};

export const verifyAgreement = async (req: Request, res: Response) => {
  const agreementId = req.params.agreementId as string;
  const userId = (req as any).userId;

  const agreement = await prisma.agreement.findUnique({
    where: { id: agreementId },
  });

  if (!agreement) {
    return res.status(404).json({ error: "Agreement not found" });
  }

  // 🔐 AUTHORIZATION
  if (
    agreement.senderId !== userId &&
    agreement.receiverId !== userId
  ) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const recalculatedHash = generateAgreementHash(
    agreement.title,
    agreement.content,
    agreement.senderId,
    agreement.receiverId,
  );

  const valid = recalculatedHash === agreement.hash;

  res.json({
    agreementId: agreement.id,
    valid,
    storedHash: agreement.hash,
    recalculatedHash,
  });
};

export const rateUser = async (req: Request, res: Response) => {
  const raterId = (req as any).userId;
  const { rating, review } = req.body;
  const agreementId = req.params.agreementId as string;

  const agreement = await prisma.agreement.findUnique({
    where: { id: agreementId },
  });

  if (!agreement) {
    return res.status(404).json({ error: "Agreement not found" });
  }

  // 🔐 Must be part of agreement
  if (
    agreement.senderId !== raterId &&
    agreement.receiverId !== raterId
  ) {
    return res.status(403).json({ error: "Not part of agreement" });
  }

  // ❌ Must be completed
  if (!agreement.senderSigned || !agreement.receiverSigned) {
    return res.status(400).json({ error: "Agreement not fully signed" });
  }

  // ⭐ Rating validation
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }

  const receiverId =
    agreement.senderId === raterId ? agreement.receiverId : agreement.senderId;

  const rate = await prisma.rating.create({
    data: {
      rating,
      review,
      raterId,
      receiverId,
      agreementId,
    },
  });

  res.json(rate);
};

export const getUserRating = async (req: Request, res: Response) => {
  const userId = req.params.id as string;

  const ratings = await prisma.rating.findMany({
    where: { receiverId: userId },
  });

  const avg =
    ratings.length === 0
      ? 0
      : ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

  res.json({
    average: avg.toFixed(1),
    total: ratings.length,
  });
};

export const getReviews = async (req: Request, res: Response) => {
  const userId = req.params.id as string;

  const reviews = await prisma.rating.findMany({
    where: { receiverId: userId },
    include: {
      rater: {
        select: {
          fullName: true,
          avatar: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(reviews);
};
