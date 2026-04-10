import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "../types/auth.js";

export const followUser = async (req:AuthRequest, res: Response) => {
  const followerId = req.userId;
  const followingId = req.body.followingId as string;

  if (!followerId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (followerId === followingId) {
    return res.status(400).json({ error: "You cannot follow yourself" });
  }

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });

  if (existing) {
    return res.status(400).json({ error: "Already following" });
  }

  const follow = await prisma.follow.create({
    data: { followerId, followingId },
  });

  res.json(follow);
};

export const unfollowUser = async (req: Request, res: Response) => {
  const followerId = (req as any).userId;
  const followingId = req.body.followingId as string;

  await prisma.follow.delete({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });

  res.json({ message: "Unfollowed successfully" });
};

export const getFollowers = async (req: Request, res: Response) => {
  const userId = req.params.id as string;

  const count = await prisma.follow.count({
    where: { followingId: userId },
  });

  res.json({ followers: count });
};

export const getFollowing = async (req: Request, res: Response) => {
  const userId = req.params.id as string;

  const count = await prisma.follow.count({
    where: { followerId: userId },
  });

  res.json({ following: count });
};

export const checkFollowStatus = async (req: Request, res: Response) => {
  const followerId = (req as any).userId;
  const userId = req.params.userId as string;

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId: userId,
      },
    },
  });

  res.json({ isFollowing: !!existing });
};

export const listFollowers = async (req: Request, res: Response) => {
  const userId = req.params.id as string;

  const followers = await prisma.follow.findMany({
    where: { followingId: userId },
    include: {
      follower: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
    },
  });

  res.json(followers);
};
