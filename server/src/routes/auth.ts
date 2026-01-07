// src/routes/auth.ts
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.ts";
import { hashPassword, verifyPassword } from "../utils/hash.ts";

const router = express.Router();

// Helper: Generate tokens
const generateTokens = (user: any) => {
  const payload = { sub: user._id.toString(), email: user.email, role: user.role };
  // Access token: 1 day, Refresh token: 30 days
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET || "", { expiresIn: "1d" });
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET || "", { expiresIn: "30d" });
  return { accessToken, refreshToken };
};

// Register user (student)
router.post("/signup", async (req, res) => {
  try {
    const { email, name, password } = req.body as {
      email?: string;
      name?: string;
      password?: string;
    };

    if (!email || !name || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const passwordHash = hashPassword(password);
    const user = await User.create({
      email,
      name,
      role: "student",
      passwordHash,
    });

    const userId = user._id.toString();

    return res.json({
      message: "Student created",
      user: {
        id: userId,
        email: user.email,
        name: user.name,
        role: "student",
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Server error", error: err });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body as {
    email: string;
    password: string;
    role?: string;
  };

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  if (role && user.role !== role) {
    return res.status(403).json({ message: "Role mismatch" });
  }

  const isValid = verifyPassword(password, user.passwordHash);
  if (!isValid) return res.status(401).json({ message: "Invalid credentials" });

  if (!user.passwordHash.includes("$")) {
    user.passwordHash = hashPassword(password);
    await user.save();
  }

  const { accessToken, refreshToken } = generateTokens(user);

  // Save refresh token to DB
  user.refreshTokens.push(refreshToken);
  await user.save();

  return res.json({
    accessToken,
    refreshToken,
    user: {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    },
  });
});

// Refresh token
router.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };

  if (!refreshToken) {
    return res.status(400).json({ message: "Missing refresh token" });
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET || "") as any;
    const user = await User.findById(payload.sub);

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Remove old refresh token
    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);

    // Generate new tokens
    const tokens = generateTokens(user);
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    return res.json(tokens);
  } catch {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
});

// Logout
router.post("/logout", async (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };

  if (refreshToken) {
    try {
      const payload = jwt.verify(refreshToken, process.env.JWT_SECRET || "") as any;
      const user = await User.findById(payload.sub);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
        await user.save();
      }
    } catch {
      // Token invalid, ignore
    }
  }

  return res.json({ message: "Logged out" });
});

export default router;
