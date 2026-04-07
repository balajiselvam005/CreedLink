import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const addSkill = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { name } = req.body;

  const skill = await prisma.skill.create({
    data: { name, userId },
  });

  res.json(skill);
};

export const getSkills = async (req: Request, res: Response) => {
  const userId = req.params.id as string;

  const skills = await prisma.skill.findMany({
    where: { userId },
  });

  res.json(skills);
};
