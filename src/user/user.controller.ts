import { Request, Response } from "express";
import { prisma } from "../prisma";
import { StatusCodes } from "http-status-codes";
import { userSchema, validateIdSchema } from "./user.schema";

export default class UserController {
  static async AllUsers(req: Request, res: Response) {
    const allUser = await prisma.user.findMany();

    if (allUser) {
      res.status(StatusCodes.OK).json(allUser);
      return;
    }

    res
      .status(StatusCodes.BAD_REQUEST)
      .json(
        "Unable to fetch users at the moment, Please try again after some time."
      );
    return;
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    static async User(req: Request, res: Response) {
      return res.status(StatusCodes.OK).json(req.currentUser);
    }

  //   /////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    static async AddUser(req: Request, res: Response) {
      const { body } = req.body;

      const error = userSchema.parse(body);

      if (error) {
        return res.status(StatusCodes.BAD_REQUEST).json("Cannot create user for your Data");
      }

      const existingUserWithEmail = await prisma.user.findUnique({
        where: { email: body.email },
      });

      if (existingUserWithEmail) {
        res.status(StatusCodes.CONFLICT).json("Email already exist");
        return;
      }

      const existingUserWithPhone = await prisma.user.findUnique({
        where: { phone: body.phone.toString() },
      });

      if (existingUserWithPhone) {
        res.status(StatusCodes.CONFLICT).json("Phone no. already exist");
        return;
      }

      const newUser = await prisma.user.create({
        data: {
            email: body.email,
            name: body.name,
            gender: body.gender,
            age: body.age,
            phone: body.phone,
        }
      });

      const {id:userId,...resUser}=newUser;

      res.status(StatusCodes.CREATED).json({resUser});
      return 
    }

  //   /////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    static async UpdateUser(req: Request, res: Response) {
      const user = req.currentUser;

      const { body } = req.body;

      const error = userSchema.parse(body);



      if (error) {
        return res.status(StatusCodes.BAD_REQUEST).json("Cannot update user for your data ")
      }

      const updatedUser=await prisma.user.update({
        where:{id:body.id},
        data:{
            name:body.name,
            email: body.email,
            phone: body.phone,
            age: body.age,
            gender: body.gender,
        }
      })

      const {id:userId,...resUser}=updatedUser
    
      res.status(StatusCodes.OK).json({resUser});
      return 
    }

  //   /////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    static async DeleteUser(req: Request, res: Response) {

      const id = req.params.id;

      const error = validateIdSchema.parse({ id });

      if (error) {
        return res.status(StatusCodes.BAD_REQUEST).json("Cannot Delete user for your request");
      }


      const user = await prisma.user.delete({
        where: { id: id },
      });

      if (!user) {
        return res.status(StatusCodes.UNAUTHORIZED).json("No User found");
      }

      res.status(StatusCodes.OK).json("User Deleted succesfully");
    }
}
