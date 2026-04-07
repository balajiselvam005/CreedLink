import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { redis } from "../lib/redis.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { profile } from "node:console";

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName: "",
        username: null,
        email,
        password: hashedPassword,
        role: "",
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatar: true,
        profileCompleted: true,
      },
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await redis.set(user.id, refreshToken, {
      EX: 7 * 24 * 60 * 60,
    });

    res
      .status(201)
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ message: "User Created", accessToken, user });
  } catch (err) {
    res.status(500).json({ error: `Signup failed: ${err}` });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: "Invalid Password" });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await redis.set(user.id, refreshToken, {
      EX: 7 * 24 * 60 * 60,
    });

    res
      .status(201)
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: "Login Successfull",
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          avatar: user.avatar,
          profileCompleted: user.profileCompleted,
        },
      });
  } catch (err) {
    res.status(500).json({ error: `Login failed: ${err}` });
  }
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET!) as {
      userId: string;
    };
    const storedToken = await redis.get(payload.userId);
    if (storedToken !== refreshToken) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }
    const newAccessToken = generateAccessToken(payload.userId);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ error: `Invalid token: ${err}` });
  }
};

export const logout = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  await redis.del(userId);
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
};
