import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { generateAgreementHash } from "../utils/hash.js";
import { generateAgreementNumber } from "../utils/agreementNumber.js";

/**
 * Create Agreement
 * Used for draft + send agreement
 */
export const createAgreement = async (req: Request, res: Response) => {
  try {
    const { title, content, receiverEmail, role, signature } = req.body;
    const agreementNumber = await generateAgreementNumber();

    const receiver = await prisma.user.findUnique({
      where: { email: receiverEmail },
    });

    if (!receiver) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    const receiverId = receiver.id;
    const senderId = (req as any).userId;

    const hash = generateAgreementHash(title, content, senderId, receiverId);
    console.log(hash);

    const agreement = await prisma.agreement.create({
      data: {
        agreementNumber,
        title,
        content,

        senderId,
        receiverId,

        hash,

        senderSigned: !!signature,
        senderSignature: signature || null,
        senderSignedAt: signature ? new Date() : null,

        status: signature ? "SENT" : "DRAFT",
      },
    });

    res.json(agreement);
  } catch (error) {
    res.status(500).json({ error: "Failed to create agreement" });
  }
};

/**
 * Get Agreements for My Agreements Page
 */
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

/**
 * Get Agreement By ID
 */
export const getAgreementById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const agreement = await prisma.agreement.findUnique({
      where: { id },
      include: {
        sender: true,
        receiver: true,
      },
    });

    res.json(agreement);
  } catch (error) {
    res.status(500).json({ error: "Agreement not found" });
  }
};

/**
 * Receiver Signs Agreement
 */
export const signAgreement = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { signature } = req.body;

    const agreementExists = await prisma.agreement.findUnique({
      where: { id },
    });

    if (!agreementExists) {
      return res.status(404).json({ error: "Agreement not found" });
    }

    const agreement = await prisma.agreement.update({
      where: { id },
      data: {
        receiverSignature: signature,
        receiverSigned: true,
        receiverSignedAt: new Date(),
        status: "COMPLETED",
      },
    });

    res.json(agreement);
  } catch (error) {
    res.status(500).json({ error: "Failed to sign agreement" });
  }
};

export const verifyAgreement = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const agreement = await prisma.agreement.findUnique({
    where: { id },
  });

  if (!agreement) {
    return res.status(404).json({ error: "Agreement not found" });
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
  const agreementId = (req as any).params.id;

  const agreement = await prisma.agreement.findUnique({
    where: { id: agreementId },
  });

  if (!agreement || agreement.status !== "COMPLETED") {
    return res.status(400).json({ error: "Agreement not completed" });
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
