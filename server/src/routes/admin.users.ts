// src/routes/admin.users.ts
import express from "express";
import User from "../models/User.ts";
import {
  getPaginationParams,
  buildPaginatedResult,
} from "../utils/pagination.ts";
import { queryFilter } from "../utils/queryFilter.ts";
import { authenticate, isAdmin } from "../middlewares/auth.ts";
import { hashPassword } from "../utils/hash.ts";
import { getUserEnrollments } from "../utils/getUserEnrollments.ts";

const router = express.Router();

/* ==============================
   GET /api/admin/users
================================ */
router.get("/", authenticate, isAdmin, async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);

  const filter = await queryFilter(req.query, {
    exactFields: ["role"],
    searchableFields: ["name", "email"],
  });

  const [items, total] = await Promise.all([
    User.find(filter)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.json(buildPaginatedResult(items, page, limit, total));
});

/* ==============================
   GET /api/admin/users/:id
================================ */

router.get("/:id", authenticate, isAdmin, async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash");
  if (!user) return res.sendStatus(404);

  const enrollments = await getUserEnrollments(req.params.id);

  res.json({
    ...user.toObject(),
    enrollments,
  });
});

/* ==============================
   POST /api/admin/users
================================ */
router.post("/", authenticate, isAdmin, async (req, res) => {
  const { email, name, role, password } = req.body;
  if (!email || !name || !role || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const user = await User.create({
    email,
    name,
    role,
    passwordHash: hashPassword(password),
  });

  res.status(201).json({
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
});

/* ==============================
   PUT /api/admin/users/:id
================================ */
router.put("/:id", authenticate, isAdmin, async (req, res) => {
  const { name, role, password } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) return res.sendStatus(404);

  if (name !== undefined) user.name = name;
  if (role !== undefined) user.role = role;
  if (password) user.passwordHash = hashPassword(password);

  await user.save();

  res.json({
    message: "User updated",
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
});

/* ==============================
   DELETE /api/admin/users/:id
================================ */
router.delete("/:id", authenticate, isAdmin, async (req, res) => {
  if (req.user!.id === req.params.id) {
    return res.status(400).json({ message: "Cannot delete yourself" });
  }

  const user = await User.findById(req.params.id);
  if (!user) return res.sendStatus(404);

  await user.deleteOne();
  res.json({ message: "User deleted" });
});

export default router;
