import { Response, Request, NextFunction } from "express";
import { ZodType } from "zod";

export const validate =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const parsedReq = schema.safeParse(req.body);
    if (!parsedReq.success) {
      return res.status(400).json({
        error: parsedReq.error.issues,
      });
    }
    req.body = parsedReq.data;
    next();
  };
