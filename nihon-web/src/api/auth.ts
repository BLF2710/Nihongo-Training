import api from "./axios";

export type LoginResult = { token: string; user?: { id: number; username: string; email: string; role?: string } };
export type Registration = { username: string; displayName: string; email: string; password: string; confirmPassword: string };

export async function login(login: string, password: string) {
  return (await api.post<LoginResult>("/auth/login", { login, password })).data;
}

export async function register(registration: Registration) {
  return (await api.post<{ message: string }>("/auth/register", registration)).data;
}
