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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../prisma");
const http_status_codes_1 = require("http-status-codes");
const user_schema_1 = require("./user.schema");
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = __importDefault(require("crypto"));
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
dotenv_1.default.config();
const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;
const randomImageName = (bytes = 32) => crypto_1.default.randomBytes(bytes).toString("hex");
const s3 = new client_s3_1.S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey,
    },
    region: bucketRegion,
});
class UserController {
    static AllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const allUser = yield prisma_1.prisma.user.findMany();
            if (allUser) {
                res.status(http_status_codes_1.StatusCodes.OK).json(allUser);
                return;
            }
            res
                .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                .json("Unable to fetch users at the moment, Please try again after some time.");
            return;
        });
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    static User(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.currentUser;
            if (user && user.imageName) {
                const input = {
                    Bucket: bucketName,
                    Key: `${user.imageName}`,
                };
                const command = new client_s3_1.GetObjectCommand(input);
                const url = yield (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn: 86400 });
                user.url = url;
                res.status(http_status_codes_1.StatusCodes.OK).json(user);
                return;
            }
            if (user) {
                res.status(http_status_codes_1.StatusCodes.OK).json(user);
                return;
            }
            if (!user) {
                res
                    .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                    .json("Can't find User for your Request");
                return;
            }
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json("Unable to fetch Data");
            return;
        });
    }
    //   /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    static AddUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                    const command = new client_s3_1.PutObjectCommand(params);
                    yield s3.send(command);
                }
                catch (err) {
                    console.log("error", err);
                }
            }
            const valid = user_schema_1.userSchema.parse(fields);
            if (!valid) {
                return res
                    .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                    .json("Cannot create user for your Data");
            }
            const existingUserWithEmail = yield prisma_1.prisma.user.findUnique({
                where: { email: req.body.email },
            });
            if (existingUserWithEmail) {
                res.status(http_status_codes_1.StatusCodes.CONFLICT).json("Email already exist");
                return;
            }
            const existingUserWithPhone = yield prisma_1.prisma.user.findUnique({
                where: { phone: req.body.phone.toString() },
            });
            if (existingUserWithPhone) {
                res.status(http_status_codes_1.StatusCodes.CONFLICT).json("Phone no. already exist");
                return;
            }
            const newUser = yield prisma_1.prisma.user.create({
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
            const { id: userId } = newUser, resUser = __rest(newUser, ["id"]);
            res.status(http_status_codes_1.StatusCodes.CREATED).json({ resUser });
            return;
        });
    }
    //   /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    static UpdateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const fields = {
                name: req.body.name,
                email: req.body.email,
                age: +req.body.age,
                gender: req.body.gender,
                phone: req.body.phone,
            };
            const valid = user_schema_1.userSchema.parse(fields);
            if (!valid) {
                res
                    .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
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
                    const command = new client_s3_1.PutObjectCommand(params);
                    yield s3.send(command);
                }
                catch (err) {
                    console.log("error", err);
                }
            }
            const uniqueUser = yield prisma_1.prisma.user.findUnique({
                where: { id: req.body.id },
            });
            if (uniqueUser) {
                const updatedUser = yield prisma_1.prisma.user.update({
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
                const { id: userId } = updatedUser, resUser = __rest(updatedUser, ["id"]);
                res.status(http_status_codes_1.StatusCodes.OK).json({ resUser });
                return;
            }
            res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json("User not found for your Request");
            return;
        });
    }
    //   /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    static DeleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const valid = user_schema_1.validateIdSchema.parse({ id });
            if (!valid) {
                return res
                    .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                    .json("Cannot Delete user for your request");
            }
            const user = yield prisma_1.prisma.user.findUnique({ where: { id: id } });
            if (user && user.imageName) {
                const params = {
                    Bucket: bucketName,
                    Key: `${user.imageName}`,
                };
                const command = new client_s3_1.DeleteObjectCommand(params);
                yield s3.send(command);
                yield prisma_1.prisma.user.delete({
                    where: { id: id },
                });
                res.status(http_status_codes_1.StatusCodes.OK).json("User Deleted succesfully");
                return;
            }
            if (!user) {
                return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json("No User found");
            }
            yield prisma_1.prisma.user.delete({
                where: { id: id },
            });
            res.status(http_status_codes_1.StatusCodes.OK).json("User Deleted succesfully");
            return;
        });
    }
}
exports.default = UserController;
//# sourceMappingURL=user.controller.js.map