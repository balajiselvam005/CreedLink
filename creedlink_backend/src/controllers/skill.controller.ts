import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "../types/auth.js";

export const addSkill = async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = req.userId;

  const { name } = req.body;

  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "Skill name is required" });
  } 

  const existing = await prisma.skill.findFirst({
    where: { userId, name },
  });

  if (existing) {
    return res.status(400).json({ error: "Skill already exists" });
  }

  const skill = await prisma.skill.create({
    data: { name, userId },
  });

  res.json(skill);
};

export const getSkills = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id as string;

    if (!userId) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const skills = await prisma.skill.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });

    res.json(skills);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch skills" });
  }
};
