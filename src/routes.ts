import { Router } from "express";
import userRoutes from "./user/user.routes";


const globalRouter = Router()

globalRouter.use("/user", userRoutes)

export default globalRouter