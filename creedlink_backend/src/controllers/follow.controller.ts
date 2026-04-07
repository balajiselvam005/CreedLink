import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const followUser = async (req: Request, res: Response) => {
  const followerId = (req as any).userId;
  const { followingId } = req.body;

  const follow = await prisma.follow.create({
    data: { followerId, followingId },
  });

  res.json(follow);
};

export const getFollowers = async (req: Request, res: Response) => {
  const { userId } = req.params;

  const count = await prisma.follow.count({
    where: { followingId: userId },
  });

  res.json({ followers: count });
};
