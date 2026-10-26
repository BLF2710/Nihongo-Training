import api from "./axios";

export type LoginResult = { token: string; user?: { id: number; username: string; email: string; role?: string } };
export type Registration = { username: string; displayName: string; email: string; password: string; confirmPassword: string };

export async function login(login: string, password: string) {
  return (await api.post<LoginResult>("/auth/login", { login, password })).data;
}

export async function register(registration: Registration) {
  return (await api.post<{ message: string }>("/auth/register", registration)).data;
}

/** Asks for a reset link. The answer is the same whether or not the address has an account. */
export async function requestPasswordReset(email: string) {
  return (await api.post<{ message: string }>("/auth/password/forgot", { email })).data;
}

export async function resetPassword(token: string, password: string, confirmPassword: string) {
  return (await api.post<{ message: string }>("/auth/password/reset", { token, password, confirmPassword })).data;
}

export async function verifyEmail(token: string) {
  return (await api.post<{ verified: boolean }>("/auth/email/verify", { token })).data;
}

export async function resendVerificationEmail() {
  return (await api.post<{ alreadyVerified: boolean; sentTo?: string }>("/auth/email/resend")).data;
}

/** Ends every session of the account, this one included. */
export async function logOutEverywhere() {
  return (await api.post<{ message: string }>("/auth/logout-all")).data;
}

/** Other devices are signed out; the response carries a new token for this one. */
export async function changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
  return (await api.put<{ message: string; token: string }>("/profile/me/password", { currentPassword, newPassword, confirmPassword })).data;
}
