// src/routes/users.ts
import express from "express";
import User from "../models/User.ts";
import { authenticate } from "../middlewares/auth.ts";
import { hashPassword } from "../utils/hash.ts";
import { getUserEnrollments } from "../utils/getUserEnrollments.ts";

const router = express.Router();

/* ==============================
   GET /api/users/me
================================ */
router.get("/me", authenticate, async (req, res) => {
    const user = await User.findById(req.user!.id).select("-passwordHash");
    if (!user) return res.sendStatus(404);
  
    const enrollments = await getUserEnrollments(req.user!.id);
  
    res.json({
      ...user.toObject(),
      enrollments,
    });
  });

/* ==============================
   PUT /api/users/me
================================ */
router.put("/me", authenticate, async (req, res) => {
  const { name, password } = req.body;

  const user = await User.findById(req.user!.id);
  if (!user) return res.sendStatus(404);

  if (name !== undefined) user.name = name;
  if (password) user.passwordHash = hashPassword(password);

  await user.save();

  res.json({
    message: "Profile updated",
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
});

export default router;
