import { prisma } from "../lib/prisma.js";

export const generateAgreementNumber = async () => {
  const counter = await prisma.counter.update({
    where: { name: "agreement" },
    data: { value: { increment: 1 } },
  });

  const padded = counter.value.toString().padStart(4, "0");

  return `AGR-${padded}`;
};
