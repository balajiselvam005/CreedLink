import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const addWork = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { title, client, year } = req.body;

  const work = await prisma.work.create({
    data: {
      title,
      client,
      year,
      userId,
    },
  });

  res.json(work);
};

export const getWorks = async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const works = await prisma.work.findMany({
    where: { userId },
    orderBy: { year: "desc" },
  });

  res.json(works);
};
