import { Request, Response } from "express";
import { prisma } from "../prisma";
import { StatusCodes } from "http-status-codes";
import { userSchema, validateIdSchema } from "./user.schema";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import crypto from "crypto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

type credentialType = {
  accessKeyId: string;
  secretAccessKey: string;
};

const s3 = new S3Client({
  credentials: <credentialType>{
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

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
    const user = req.currentUser;

    if (user && user.imageName) {
      const input = {
        Bucket: bucketName,
        Key: `${user.imageName}`,
      };
      const command = new GetObjectCommand(input);
      const url = await getSignedUrl(s3, command, { expiresIn: 86400 });
      user.url = url;

      res.status(StatusCodes.OK).json(user);
      return;
    }

    if (user) {
      res.status(StatusCodes.OK).json(user);
      return;
    }

    if (!user) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json("Can't find User for your Request");
      return;
    }

    res.status(StatusCodes.BAD_REQUEST).json("Unable to fetch Data");
    return;
  }

  //   /////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  static async AddUser(req: Request, res: Response) {
    const fields = {
      name: req.body.name,
      email: req.body.email,
      age: +req.body.age,
      gender: req.body.gender,
      phone: req.body.phone,
    };

    const imageName = randomImageName();

    if (req.file) {
      try {
        const params = {
          Bucket: bucketName,
          Key: imageName,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        };

        const command = new PutObjectCommand(params);

        await s3.send(command);
      } catch (err) {
        console.log("error", err);
      }
    }

    const valid = userSchema.parse(fields);

    if (!valid) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json("Cannot create user for your Data");
    }

    const existingUserWithEmail = await prisma.user.findUnique({
      where: { email: req.body.email },
    });

    if (existingUserWithEmail) {
      res.status(StatusCodes.CONFLICT).json("Email already exist");
      return;
    }

    const existingUserWithPhone = await prisma.user.findUnique({
      where: { phone: req.body.phone.toString() },
    });

    if (existingUserWithPhone) {
      res.status(StatusCodes.CONFLICT).json("Phone no. already exist");
      return;
    }

    const newUser = await prisma.user.create({
      data: {
        email: req.body.email,
        name: req.body.name,
        gender: req.body.gender,
        age: +req.body.age,
        phone: req.body.phone,
        imageName: req.file ? imageName : "",
        url: "",
      },
    });

    const { id: userId, ...resUser } = newUser;

    res.status(StatusCodes.CREATED).json({ resUser });
    return;
  }

  //   /////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  static async UpdateUser(req: Request, res: Response) {
    const fields = {
      name: req.body.name,
      email: req.body.email,
      age: +req.body.age,
      gender: req.body.gender,
      phone: req.body.phone,
    };

    const valid = userSchema.parse(fields);

    if (!valid) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json("Cannot update user for your data ");

      return;
    }

    const imageName = randomImageName();

    if (req.file) {
      try {
        const params = {
          Bucket: bucketName,
          Key: imageName,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        };

        const command = new PutObjectCommand(params);

        await s3.send(command);
      } catch (err) {
        console.log("error", err);
      }
    }

    const uniqueUser = await prisma.user.findUnique({
      where: { id: req.body.id },
    });

    if (uniqueUser) {
      const updatedUser = await prisma.user.update({
        where: { id: req.body.id },
        data: {
          name: req.body.name,
          email: req.body.email,
          phone: req.body.phone,
          age: +req.body.age,
          gender: req.body.gender,
          imageName: req.file ? imageName : uniqueUser.imageName,
          url: "",
        },
      });
      const { id: userId, ...resUser } = updatedUser;
      res.status(StatusCodes.OK).json({ resUser });
      return;
    }

    res.status(StatusCodes.NOT_FOUND).json("User not found for your Request");

    return;
  }

  //   /////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  static async DeleteUser(req: Request, res: Response) {
    const id = req.params.id;

    const valid = validateIdSchema.parse({ id });

    if (!valid) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json("Cannot Delete user for your request");
    }

    const user = await prisma.user.findUnique({ where: { id: id } });

    if (user && user.imageName) {
      const params = {
        Bucket: bucketName,
        Key: `${user.imageName}`,
      };

      const command = new DeleteObjectCommand(params);
      await s3.send(command);

      await prisma.user.delete({
        where: { id: id },
      });

      res.status(StatusCodes.OK).json("User Deleted succesfully");
      return;
    }

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json("No User found");
    }

    await prisma.user.delete({
      where: { id: id },
    });

    res.status(StatusCodes.OK).json("User Deleted succesfully");
    return;
  }
}
