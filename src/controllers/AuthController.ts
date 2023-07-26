import { compare } from "bcryptjs";
import { Request, Response } from "express";
import { prisma } from "../libs/prisma";
import { sign } from "jsonwebtoken";

export class AuthController {
  async login(req: Request, res: Response) {
    const {email, password} = req.body;

    const user = await prisma.user.findUnique({where: { email }})

    if(!user) {
      res.statusCode = 400;
      return res.json({ error: "Email ou Senha inválidos" });
    }

    const isValidPassword = await compare(password, user.password);

    if(!isValidPassword) {
      res.statusCode = 400;
      return res.json({ error: "Email ou Senha inválidos" });
    }

    const token = sign({id: user.id}, "secret_weme_vault", {expiresIn: "1d"});

    const id = { user };

    return res.json({user: {id, name, email}, token});
  }
}