import {
  Request,
  Response,
  NextFunction
} from "express";

import jwt from "jsonwebtoken";

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {

    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "No token"
      });
    }

    const token =
      authHeader.split(" ")[1];

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET!
      );

    (req as any).user = decoded;

    next();

  } catch {

    return res.status(401).json({
      message: "Invalid token"
    });
  }
}