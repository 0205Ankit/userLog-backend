"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const user_schema_1 = require("../user/user.schema");
const prisma_1 = require("../prisma");
function checkUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { body } = req.body;
        const valid = user_schema_1.validateIdSchema.parse({ id: body.id });
        if (!valid) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json("Cant find User for your Request");
        }
        const user = yield prisma_1.prisma.user.findFirst({
            where: { id: body.id },
        });
        if (user) {
            req.currentUser = user;
            return next();
        }
        return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
            info: "No User found",
        });
    });
}
exports.default = checkUser;
//# sourceMappingURL=checkUser.js.map