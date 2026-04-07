import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const {
      fullName,
      username,
      role,
      bio,
      location,
      website,
      twitter,
      instagram,
      portfolio,
    } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName,
        username,
        role,
        bio,
        location,
        website: website || null,
        twitter: twitter || null,
        instagram: instagram || null,
        portfolio: portfolio || null,
        profileCompleted: true,
      },
      select: {
        id: true,
        email: true,
        username: true,
        profileCompleted: true,
      },
    });

    res.json({
      message: "Profile updated",
      user,
    });
  } catch (err) {
    res.status(500).json({
      error: `Profile update failed: ${err}`,
    });
  }
};

export const getTopCreators = async (req: Request, res: Response) => {
  try {
    const creators = await prisma.user.findMany({
      where: {
        role: {
          not: null,
        },
        profileCompleted: true,
      },
      select: {
        id: true,
        fullName: true,
        role: true,
        avatar: true,
      },
      take: 6,
    });

    res.json(creators);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch creators" });
  }
};

export const exploreCreators = async (req: Request, res: Response) => {
  try {
    const { search, role } = req.query;

    const creators = await prisma.user.findMany({
      where: {
        profileCompleted: true,
        role: role && role !== "all" ? String(role) : undefined,
        OR: search
          ? [
              {
                fullName: {
                  contains: String(search),
                  mode: "insensitive",
                },
              },
              {
                role: {
                  contains: String(search),
                  mode: "insensitive",
                },
              },
            ]
          : undefined,
      },
      select: {
        id: true,
        fullName: true,
        role: true,
        avatar: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(creators);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch creators" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        avatar: true,
        username: true,
        role: true,
        bio: true,
        location: true,
        website: true,
        twitter: true,
        instagram: true,
        portfolio: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatar: true,
        username: true,
        role: true,
        bio: true,
        location: true,
        website: true,
        twitter: true,
        instagram: true,
        portfolio: true,
        profileCompleted: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};
