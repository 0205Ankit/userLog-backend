"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = __importDefault(require("./user.controller"));
const checkUser_1 = __importDefault(require("../middleware/checkUser"));
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
const uplaod = (0, multer_1.default)({ storage: storage });
const userRouter = (0, express_1.Router)();
userRouter.get("/get-users", user_controller_1.default.AllUsers);
userRouter.post("/find-user", checkUser_1.default, user_controller_1.default.User);
userRouter.post("/add-user", uplaod.single("image"), user_controller_1.default.AddUser);
userRouter.put("/update-user", uplaod.single("image"), user_controller_1.default.UpdateUser);
userRouter.delete("/delete-user/:id", user_controller_1.default.DeleteUser);
exports.default = userRouter;
//# sourceMappingURL=user.routes.js.map