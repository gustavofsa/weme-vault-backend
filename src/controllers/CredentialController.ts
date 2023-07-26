import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../libs/prisma";
import { PrismaClientKnownRequestError, PrismaClientUnknownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/library";

const typeEnum = z.enum(['card', 'email']);

export class CredentialController {
  async create(req: Request, res: Response) {
    const defaultProps = z.object({
      title: z.string().min(2),
    })

    const cardSchema = z.object({
      type: z.literal(typeEnum.enum.card),
      cardNumber: z.string().min(3, "O número do cartão deve ter pelo menos 3 caracteres"),
      pressedName: z.string().min(3, "O nome impresso deve ter pelo menos 3 caracteres"),
      securityCode: z.string().min(3, "O código de segurança deve ter pelo menos 3 caracteres"),
      expiration: z.string(),
      password: z.string().min(4, "A senha deve ter pelo menos 4 caracteres")
    })

    const emailSchema = z.object({
      type: z.literal(typeEnum.enum.email),
      email: z.string().email("Email inválido"),
      appUrl: z.string().url("URL inválida"),
      password: z.string()
        .min(6, "A senha deve ter pelo menos 6 caracteres")
        .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
        .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
        .regex(/[0-9]/, "A senha deve conter pelo menos um dígito")
        .regex(/[!@#$%^&*()+-]/, "A senha deve conter pelo menos um caractere especial")
    })

    const credentialSchema = z.discriminatedUnion('type', [cardSchema, emailSchema]);

    const bodySchema = z.intersection(credentialSchema, defaultProps)
    
    try {
      const data = bodySchema.parse(req.body);

      if(data.type === 'card') {
        const credential = await prisma.credential.create({
          data: {
            userId: req.userId,
            title: data.title,
            type: data.type,
            cardNumber: data.cardNumber,
            pressedName: data.pressedName,
            securityCode: data.securityCode,
            expiration: data.expiration,
            password: data.password,
          } 
        })
  
        return res.json({ credential });
      } 
      
      const credential = await prisma.credential.create({
        data: {
          userId: req.userId,
          title: data.title,
          type: data.type,
          email: data.email,
          appUrl: data.appUrl,
          password: data.password,
        } 
      })
      
  
      return res.json({ credential });
    } catch(error) {
      if (error instanceof PrismaClientKnownRequestError || error instanceof PrismaClientValidationError || error instanceof PrismaClientUnknownRequestError) {
        console.error('Erro de validação:', error.message);
        console.error('error stack:', error.stack)
        return res.status(500).json({error: 'Internal Server Error'});
      } else {
        return res.status(400).json({ error })
      }
    }
  }
}