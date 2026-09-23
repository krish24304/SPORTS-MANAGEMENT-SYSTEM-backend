import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthUser {
  id: number;
  email: string;
  role: string;
  name?: string;
  rollNo?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "sports-management-secret";

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as Record<string, unknown>;

    const userId = Number(decoded.id ?? decoded.sub);
    const email = typeof decoded.email === "string" ? decoded.email : undefined;
    const role = typeof decoded.role === "string" ? decoded.role : undefined;

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      !Number.isInteger(userId) ||
      userId <= 0 ||
      !email ||
      !role
    ) {
      return res.status(401).json({
        message: "Invalid authentication token",
      });
    }

    req.user = {
      id: userId,
      email,
      role,
      name: typeof decoded.name === "string" ? decoded.name : undefined,
      rollNo:
        typeof decoded.rollNo === "string"
          ? decoded.rollNo
          : decoded.rollNo === null
            ? null
            : undefined,
    };

    next();
  } catch (error) {
    console.error("AUTHENTICATION ERROR:", error);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const userRole = req.user.role.toLowerCase();

    const allowed = allowedRoles.some(
      (role) => role.toLowerCase() === userRole
    );

    if (!allowed) {
      return res.status(403).json({
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
}

export function requireSelfOrRole(
  paramName: string,
  ...allowedRoles: string[]
) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const requestedId = Number(req.params[paramName]);

    if (Number.isInteger(requestedId) && requestedId === req.user.id) {
      return next();
    }

    const userRole = req.user.role.toLowerCase();

    const allowed = allowedRoles.some(
      (role) => role.toLowerCase() === userRole
    );

    if (!allowed) {
      return res.status(403).json({
        message: "You do not have permission to access this resource",
      });
    }

    next();
  };
}