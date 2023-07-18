import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { validateIdSchema } from "../user/user.schema";
import { prisma } from "../prisma";

export default async function checkUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { body } = req.body;
  const valid = validateIdSchema.parse({ id: body.id });

  if (!valid) {
    return res.status(StatusCodes.BAD_REQUEST).json("Cant find User for your Request");
  }

  const user = await prisma.user.findFirst({
    where: { id: body.id },
  });

  if (user) {
    req.currentUser = user;
    return next();
  }

  return res.status(StatusCodes.UNAUTHORIZED).json({
    info: "No User found",
  });
}
