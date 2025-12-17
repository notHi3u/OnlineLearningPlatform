// server/src/middlewares/auth.ts
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const auth = req.headers.authorization;
  if (!auth) return res.sendStatus(401);

  const token = auth.split(" ")[1];
  if (!token) return res.sendStatus(401);

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as any;

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch {
    return res.sendStatus(401);
  }
};

// 👇 optional version
export const authenticateOptional = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const auth = req.headers.authorization;
  if (!auth) return next();

  const token = auth.split(" ")[1];
  if (!token) return next();

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as any;

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    // ignore
  }

  next();
};
