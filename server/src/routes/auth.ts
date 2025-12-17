// src/routes/auth.ts
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.ts";
import { hashPassword, verifyPassword } from "../utils/hash.ts";

const router = express.Router();

// ... isStrongPassword nếu bạn có ...

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

    // if (!isStrongPassword(password)) { ... }

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

    const userId = user._id.toString(); // 👈 thay vì user.id

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

  const userId = user._id.toString(); // 👈 dùng _id

  const token = jwt.sign(
    {
      sub: userId,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || "",
    { expiresIn: "2h" }
  );

  return res.json({
    token,
    user: {
      id: userId,
      email: user.email,
      role: user.role,
      name: user.name,
    },
  });
});

export default router;
