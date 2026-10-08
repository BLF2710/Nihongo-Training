import { isAxiosError } from "axios";

/** The message sent by the server when there is one, otherwise the caller's fallback. */
export function apiErrorMessage(error: unknown, fallback: string): string {
  return (isAxiosError<{ message?: string }>(error) && error.response?.data?.message) || fallback;
}

export function isUnauthorized(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 401;
}
