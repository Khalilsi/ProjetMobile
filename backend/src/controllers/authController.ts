import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/auth";

// ─── helpers ──────────────────────────────────────────────────────────────────

const generateAccessToken = (userId: string, username: string): string =>
  jwt.sign({ userId, username }, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as any,
  });

const generateRefreshToken = (userId: string, username: string): string =>
  jwt.sign({ userId, username }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as any,
  });

// ─── SIGN UP ──────────────────────────────────────────────────────────────────
// POST /api/auth/signup
export const signup = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res
      .status(400)
      .json({ message: "username, email and password are required" });
    return;
  }

  try {
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? "email" : "username";
      res.status(409).json({ message: `This ${field} is already taken` });
      return;
    }

    const user = await User.create({ username, email, password });

    const accessToken = generateAccessToken(user._id.toString(), user.username);
    const refreshToken = generateRefreshToken(
      user._id.toString(),
      user.username,
    );

    // Save refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      message: "Account created successfully",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error during signup" });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "email and password are required" });
    return;
  }

  try {
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const accessToken = generateAccessToken(user._id.toString(), user.username);
    const refreshToken = generateRefreshToken(
      user._id.toString(),
      user.username,
    );

    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────────
// POST /api/auth/refresh
export const refreshToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ message: "Refresh token is required" });
    return;
  }

  try {
    const secret = process.env.JWT_REFRESH_SECRET!;
    const decoded = jwt.verify(refreshToken, secret) as {
      userId: string;
      username: string;
    };

    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      res.status(401).json({ message: "Invalid refresh token" });
      return;
    }

    const newAccessToken = generateAccessToken(
      user._id.toString(),
      user.username,
    );
    const newRefreshToken = generateRefreshToken(
      user._id.toString(),
      user.username,
    );

    user.refreshToken = newRefreshToken;
    await user.save();

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch {
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
// POST /api/auth/logout
export const logout = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    await User.findByIdAndUpdate(req.userId, { refreshToken: null });
    res.status(200).json({ message: "Logged out successfully" });
  } catch {
    res.status(500).json({ message: "Server error during logout" });
  }
};

// ─── GET ME ───────────────────────────────────────────────────────────────────
// GET /api/auth/me
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select(
      "-password -refreshToken",
    );
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({ user });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
