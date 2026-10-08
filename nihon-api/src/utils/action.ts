import type { Request, Response } from "express";
import { HttpError } from "./http-error";

type Action = (req: Request, res: Response) => Promise<unknown>;
type Fallback = { label: string; message: string; status?: number };

/**
 * Wraps a controller action so services can signal expected failures by throwing HttpError.
 * Unexpected errors are logged and answered with the action's own fallback message;
 * without a fallback they propagate to Express.
 */
export function action(run: Action, fallback?: Fallback): Action {
  return async (req, res) => {
    try {
      return await run(req, res);
    } catch (error) {
      if (error instanceof HttpError) return res.status(error.status).json(error.body);
      if (!fallback) throw error;
      console.error(fallback.label, error);
      return res.status(fallback.status ?? 500).json({ message: fallback.message });
    }
  };
}
