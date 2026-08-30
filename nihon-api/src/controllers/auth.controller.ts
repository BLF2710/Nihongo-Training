import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { pool } from "../config/db";
import { findUserByEmail, findUserByUsername } from "../services/user.service";
import jwt from "jsonwebtoken";
import {
  findUserByLogin
} from "../services/user.service";


export async function register(
  req: Request,
  res: Response
) {
  try {
    const { username, displayName, email, password, confirmPassword } = req.body;
    const cleanUsername = typeof username === "string" ? username.trim() : "";
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const cleanDisplayName = typeof displayName === "string" ? displayName.trim() : "";
    if (!/^[A-Za-z0-9_]{3,30}$/.test(cleanUsername) || !/^\S+@\S+\.\S+$/.test(cleanEmail) || typeof password !== "string" || password.length < 8 || password !== confirmPassword) {
      return res.status(400).json({ message: "Use a 3–30 character username, valid email, and matching password of at least 8 characters." });
    }

    const [existingUser, existingUsername] = await Promise.all([findUserByEmail(cleanEmail), findUserByUsername(cleanUsername)]);

    if (existingUser || existingUsername) {
      return res.status(400).json({
        message: existingUser ? "Email already exists" : "Username already exists"
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query("INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id", [cleanUsername, cleanEmail, hashedPassword]);
      await client.query("INSERT INTO user_profiles (user_id, display_name) VALUES ($1, $2)", [result.rows[0].id, cleanDisplayName || cleanUsername]);
      await client.query("INSERT INTO user_gamification (user_id) VALUES ($1)", [result.rows[0].id]);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally { client.release(); }

    res.status(201).json({
      message: "Register success"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error"
    });
  }
}

export async function login(
  req: Request,
  res: Response
) {
  try {
    const {login, password} = req.body;
    if (typeof login !== "string" || typeof password !== "string" || !login.trim() || !password) return res.status(400).json({ message: "Login and password are required" });

    const user = await findUserByLogin(login);

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    if (user.status && user.status !== "active") return res.status(403).json({ message: "This account is inactive" });

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        userId: user.id
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d"
      }
    );

    await pool.query("UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1", [user.id]);

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
}
