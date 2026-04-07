import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const getDashboard = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    /* ---------------------------------- */
    /* AGREEMENT BASE FILTER              */
    /* ---------------------------------- */

    const baseFilter = {
      OR: [{ senderId: userId }, { receiverId: userId }],
    };

    /* ---------------------------------- */
    /* BASIC COUNTS                       */
    /* ---------------------------------- */

    const [total, sent, received] = await Promise.all([
      prisma.agreement.count({ where: baseFilter }),

      prisma.agreement.count({
        where: { senderId: userId },
      }),

      prisma.agreement.count({
        where: { receiverId: userId },
      }),
    ]);

    /* ---------------------------------- */
    /* SIGNED BY BOTH                     */
    /* ---------------------------------- */

    const signedBoth = await prisma.agreement.count({
      where: {
        ...baseFilter,
        senderSigned: true,
        receiverSigned: true,
      },
    });

    /* ---------------------------------- */
    /* ACTION REQUIRED                    */
    /* ---------------------------------- */

    const waitingYou = await prisma.agreement.count({
      where: {
        receiverId: userId,
        receiverSigned: false,
      },
    });

    const waitingThem = await prisma.agreement.count({
      where: {
        senderId: userId,
        receiverSigned: false,
      },
    });

    /* ---------------------------------- */
    /* SIGNATURE BREAKDOWN                */
    /* ---------------------------------- */

    const [bothSigned, bothPending, rejected] = await Promise.all([
      prisma.agreement.count({
        where: {
          ...baseFilter,
          senderSigned: true,
          receiverSigned: true,
        },
      }),

      prisma.agreement.count({
        where: {
          ...baseFilter,
          senderSigned: false,
          receiverSigned: false,
        },
      }),

      prisma.agreement.count({
        where: {
          ...baseFilter,
          status: "REJECTED",
        },
      }),
    ]);

    const youSigned = await prisma.agreement.count({
      where: {
        OR: [
          {
            senderId: userId,
            senderSigned: true,
            receiverSigned: false,
          },
          {
            receiverId: userId,
            receiverSigned: true,
            senderSigned: false,
          },
        ],
      },
    });

    const theySigned = await prisma.agreement.count({
      where: {
        OR: [
          {
            senderId: userId,
            senderSigned: false,
            receiverSigned: true,
          },
          {
            receiverId: userId,
            receiverSigned: false,
            senderSigned: true,
          },
        ],
      },
    });

    /* ---------------------------------- */
    /* AGREEMENT TYPES                    */
    /* ---------------------------------- */

    const agreementTypes = await prisma.agreement.groupBy({
      by: ["type"],
      where: baseFilter,
      _count: true,
    });

    const formattedTypes = agreementTypes.map((t) => ({
      type: t.type || "UNKNOWN",
      count: t._count,
    }));

    /* ---------------------------------- */
    /* MONTHLY PERFORMANCE                */
    /* ---------------------------------- */

    const agreements = await prisma.agreement.findMany({
      where: baseFilter,
      select: {
        createdAt: true,
        senderSigned: true,
        receiverSigned: true,
      },
    });

    const monthlyMap: Record<string, any> = {};

    agreements.forEach((a) => {
      const month = new Date(a.createdAt).toLocaleString("default", {
        month: "short",
      });

      if (!monthlyMap[month]) {
        monthlyMap[month] = {
          month,
          agreements: 0,
          signed: 0,
        };
      }

      monthlyMap[month].agreements++;

      if (a.senderSigned && a.receiverSigned) {
        monthlyMap[month].signed++;
      }
    });

    const monthlyPerformance = Object.values(monthlyMap);

    /* ---------------------------------- */
    /* BIDIRECTIONAL FLOW                 */
    /* ---------------------------------- */

    const flowMap: Record<string, any> = {};

    agreements.forEach((a: any) => {
      const date = new Date(a.createdAt).toISOString().split("T")[0];

      if (!flowMap[date]) {
        flowMap[date] = {
          date,
          sent: 0,
          received: 0,
        };
      }

      if (a.senderId === userId) flowMap[date].sent++;
      if (a.receiverId === userId) flowMap[date].received++;
    });

    const bidirectionalFlow = Object.values(flowMap);

    /* ---------------------------------- */
    /* TOP COLLABORATORS                  */
    /* ---------------------------------- */

    const collaboratorMap: Record<string, any> = {};

    const collaboratorAgreements = await prisma.agreement.findMany({
      where: baseFilter,
      include: {
        sender: { select: { id: true, fullName: true, email: true } },
        receiver: { select: { id: true, fullName: true, email: true } },
      },
    });

    collaboratorAgreements.forEach((a) => {
      const other = a.senderId === userId ? a.receiver : a.sender;

      if (!collaboratorMap[other.id]) {
        collaboratorMap[other.id] = {
          id: other.id,
          name: other.fullName || other.email,
          sent: 0,
          received: 0,
          bothSigned: 0,
        };
      }

      if (a.senderId === userId) collaboratorMap[other.id].sent++;
      if (a.receiverId === userId) collaboratorMap[other.id].received++;

      if (a.senderSigned && a.receiverSigned)
        collaboratorMap[other.id].bothSigned++;
    });

    const topCollaborators = Object.values(collaboratorMap)
      .sort((a: any, b: any) => b.bothSigned - a.bothSigned)
      .slice(0, 5);

    /* ---------------------------------- */
    /* QUICK INSIGHTS                     */
    /* ---------------------------------- */

    const completionRate =
      total === 0 ? 0 : Math.round((signedBoth / total) * 100);

    const quickInsights = {
      avgResponseTime: "2.3 days",
      completionRate,
      revenueGrowth: "+34%",
      totalRevenue: 71000,
    };

    /* ---------------------------------- */
    /* RESPONSE                           */
    /* ---------------------------------- */

    res.json({
      stats: {
        total,
        sent,
        received,
        signedBoth,
        waitingYou,
        waitingThem,
      },

      signatureBreakdown: {
        bothSigned,
        youSigned,
        theySigned,
        bothPending,
        rejected,
      },

      actionRequired: {
        yourAction: waitingYou,
        theirAction: waitingThem,
        completed: signedBoth,
        rejected,
      },

      agreementTypes: formattedTypes,

      monthlyPerformance,

      bidirectionalFlow,

      topCollaborators,

      quickInsights,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Dashboard failed" });
  }
};
