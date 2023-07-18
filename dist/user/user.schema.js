"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = exports.userSchema = exports.validateIdSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.validateIdSchema = zod_1.default.object({
    id: zod_1.default.string(),
});
exports.userSchema = zod_1.default.object({
    name: zod_1.default.string().min(1).max(30).trim(),
    email: zod_1.default.string().email().trim(),
    phone: zod_1.default.string().min(10).max(10).trim(),
    gender: zod_1.default.string().min(1).trim(),
    age: zod_1.default.number().min(1).nonnegative(),
});
exports.updateUserSchema = zod_1.default.object({
    name: zod_1.default.string().min(1).max(30).trim(),
    email: zod_1.default.string().email().trim(),
    phone: zod_1.default.string().min(10).max(10).trim(),
    gender: zod_1.default.string().min(1).trim(),
    age: zod_1.default.number().min(1).nonnegative(),
    id: zod_1.default.number().min(1).nonnegative(),
});
//# sourceMappingURL=user.schema.js.map