import { Router } from "express";
import UserController from "./user.controller";
import checkUser from "../middleware/checkUser";

const userRouter = Router();

userRouter.get("/get-users", UserController.AllUsers);
userRouter.post("/find-user", checkUser, UserController.User);
userRouter.post("/add-user", UserController.AddUser);
userRouter.put("/update-user", UserController.UpdateUser);
userRouter.delete("/delete-user/:id", UserController.DeleteUser);

export default userRouter;
