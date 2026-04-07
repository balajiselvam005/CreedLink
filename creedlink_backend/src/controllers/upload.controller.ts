import { Request, Response } from "express";
import cloudinary from "../lib/cloudinary.js";
import { prisma } from "../lib/prisma.js";
import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";

export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "creedlink/avatar", width: 300, height: 300, crop: "fill" },
        (error: UploadApiErrorResponse | undefined, result) => {
          if (error || !result) return reject(new Error(JSON.stringify(error)));
          resolve(result);
        },
      );
      stream.end(req.file!.buffer);
    });

    await prisma.user.update({
      where: { id: userId },
      data: { avatar: result.secure_url },
    });
    res.json({ message: "Avatar uploaded", avatar: result.secure_url });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : JSON.stringify(err),
    });
  }
};
