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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = exports.updatePassword = exports.deleteUser = exports.refreshToken = exports.getUserById = exports.loginUser = exports.registerUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const customAPIError_1 = require("../errors/customAPIError");
const asyncWrapper_1 = __importDefault(require("../middleware/asyncWrapper"));
const User_1 = __importDefault(require("../model/User"));
const successResp_1 = require("../middleware/successResp");
const APIfeature_1 = require("../util/APIfeature");
const cacheService_1 = __importDefault(require("../util/cacheService"));
const getNewToken = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isUser = (payload === null || payload === void 0 ? void 0 : payload.userId) ? true : false;
    let data;
    if (isUser) {
        const user = yield User_1.default.findOne({ _id: payload.userId });
        if (user) {
            data = { token: user.generateJWT() };
        }
    }
    return data;
});
const refreshToken = (0, asyncWrapper_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
        const message = "Unauthenticaded No Bearer";
        return next((0, customAPIError_1.createCustomError)(message, 401));
    }
    let data;
    const token = authHeader.split(" ")[1];
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        data = yield getNewToken(payload);
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            const payload = jsonwebtoken_1.default.decode(token, { complete: true }).payload;
            data = yield getNewToken(payload);
            if (!data) {
                const message = "Authentication failed invalid JWT";
                return next((0, customAPIError_1.createCustomError)(message, 401));
            }
        }
        else {
            const message = "Authentication failed invalid JWT";
            return next((0, customAPIError_1.createCustomError)(message, 401));
        }
    }
    res.status(200).json((0, successResp_1.sendSuccessApiResponse)(data, 200));
}));
exports.refreshToken = refreshToken;
const registerUser = (0, asyncWrapper_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, } = req.body;
    const emailisActive = yield User_1.default.findOne({ email });
    if (emailisActive) {
        const message = "Email is already registered";
        return next((0, customAPIError_1.createCustomError)(message, 406));
    }
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    const user = yield User_1.default.create({ name, email, password: hashedPassword });
    const data = { created: true, user, token: user.generateJWT() };
    res.status(201).json((0, successResp_1.sendSuccessApiResponse)(data, 201));
}));
exports.registerUser = registerUser;
const getUserById = (0, asyncWrapper_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    let result;
    const isCashed = yield cacheService_1.default.getItem(id);
    if (isCashed) {
        result = JSON.parse(isCashed);
    }
    else {
        result = yield User_1.default.findById(id);
        if (!result) {
            next((0, customAPIError_1.createCustomError)('User not found', 404));
        }
        yield cacheService_1.default.setItem(id, JSON.stringify(result), { ttl: 60 });
    }
    res.status(200).json((0, successResp_1.sendSuccessApiResponse)(result, 200));
}));
exports.getUserById = getUserById;
const loginUser = (0, asyncWrapper_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const emailExists = yield User_1.default.findOne({ email }, "name email password");
    if (emailExists) {
        const isPasswordRight = yield bcrypt_1.default.compare(password, emailExists.password);
        if (!isPasswordRight) {
            const message = "Invalid credentials";
            return next((0, customAPIError_1.createCustomError)(message, 401));
        }
        const data = {
            canLogIn: true,
            name: emailExists.name,
            email: emailExists.email,
            token: emailExists.generateJWT(),
        };
        res.status(200).json((0, successResp_1.sendSuccessApiResponse)(data, 200));
    }
    else {
        const message = "Invalid credentials";
        next((0, customAPIError_1.createCustomError)(message, 401));
    }
}));
exports.loginUser = loginUser;
const deleteUser = (0, asyncWrapper_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield User_1.default.findByIdAndDelete(id);
    if (!user) {
        next((0, customAPIError_1.createCustomError)('User not found', 404));
    }
    res.status(200).json((0, successResp_1.sendSuccessApiResponse)({ message: 'User deleted successfully' }, 200));
}));
exports.deleteUser = deleteUser;
const updatePassword = (0, asyncWrapper_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { currentPassword, newPassword } = req.body;
    const id = req.user.userId;
    const user = yield User_1.default.findOne({ _id: id });
    if (!user) {
        const message = "There was an error finding the email";
        return next((0, customAPIError_1.createCustomError)(message, 401));
    }
    const isCurrentPasswordCorrect = yield bcrypt_1.default.compare(currentPassword, user.password);
    if (!isCurrentPasswordCorrect) {
        const message = "Invalid current password";
        return next((0, customAPIError_1.createCustomError)(message, 400));
    }
    const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
    user.password = hashedPassword;
    yield user.save();
    const data = { updatedPassword: true, email: user.email };
    res.status(200).json((0, successResp_1.sendSuccessApiResponse)(data, 200));
}));
exports.updatePassword = updatePassword;
const getUsers = (0, asyncWrapper_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let result;
    const isCashed = yield cacheService_1.default.getItem("all_users");
    if (isCashed) {
        result = JSON.parse(isCashed);
    }
    else {
        result = yield User_1.default.find();
        yield cacheService_1.default.setItem("all_users", JSON.stringify(result), { ttl: 60 });
    }
    const query = yield (0, APIfeature_1.sort)(req.query, result);
    const query2 = yield (0, APIfeature_1.page)(req.query, query);
    res.status(200).json((0, successResp_1.sendSuccessApiResponse)(query2, 200));
}));
exports.getUsers = getUsers;
//# sourceMappingURL=auth.controller.js.map