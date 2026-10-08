import * as authService from "../services/auth.service";
import { action } from "../utils/action";

export const register = action(async (req, res) => {
  await authService.register(req.body);
  return res.status(201).json({ message: "Register success" });
}, { label: "register", message: "Server error" });

export const login = action(async (req, res) => {
  return res.json(await authService.login(req.body));
}, { label: "login", message: "Server error" });
