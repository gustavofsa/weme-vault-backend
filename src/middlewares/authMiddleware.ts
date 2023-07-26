import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

interface TokenPayload {
  id: string;
  iat: number;
  exp: number;
}

export function AuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const {authorization} = req.headers;

  if(!authorization) {
    return res.status(401).json({error: "Usuário não está autorizado"});
  }

  const [, token] = authorization.split(" ");

  try {
    const decoded = verify(token, "secret_weme_vault")
    const { id } = decoded as TokenPayload;

    req.userId = id;
    next();
  } catch(err) {
    return res.status(401).json({ error: "Token inválido" });
  }
}