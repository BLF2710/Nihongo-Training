import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { pool } from "../config/db";
import { findUserByEmail } from "../services/user.service";
import jwt from "jsonwebtoken";
import {
  findUserByLogin
} from "../services/user.service";


export async function register(
  req: Request,
  res: Response
) {
  try {
    const {
      username,
      email,
      password
    } = req.body;

    const existingUser =
      await findUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    await pool.query(
      `
      INSERT INTO users
      (username,email,password)
      VALUES ($1,$2,$3)
      `,
      [
        username,
        email,
        hashedPassword
      ]
    );

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

    const user = await findUserByLogin(login);

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

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

    return res.json({
      token
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
}