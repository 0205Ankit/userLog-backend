import { Router } from "express";
import UserController from "./user.controller";
import checkUser from "../middleware/checkUser";
import multer from "multer";

const storage = multer.memoryStorage();
const uplaod = multer({ storage: storage });

const userRouter = Router();

userRouter.get("/get-users", UserController.AllUsers);
userRouter.post("/find-user", checkUser, UserController.User);
userRouter.post("/add-user",uplaod.single("image"), UserController.AddUser);
userRouter.put("/update-user",uplaod.single("image"), UserController.UpdateUser);
userRouter.delete("/delete-user/:id", UserController.DeleteUser);

export default userRouter;
