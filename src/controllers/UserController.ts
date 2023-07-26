import { Request, Response } from "express";
import { prisma } from "../libs/prisma";
import { hash } from "bcryptjs";

export class UserController {
  async register(req: Request, res: Response) {
    const {name, email, password} = req.body;
    
    const userExists = await prisma.user.findUnique({where: { email }});

    if(userExists) {
      return res.status(400).json({ error: "Usuário já cadastrado" });
    }

    const passwordHash = await hash(password, 8);
    const user = await prisma.user.create({
      data: {
        name, email, password: passwordHash
      }
    })

    return res.json({ user });
  }

  async listUsers(req: Request, res: Response) {
    const users = await prisma.user.findMany();
    return res.json({ users });
  }
}