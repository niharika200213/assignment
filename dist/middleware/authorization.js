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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const customAPIError_1 = require("../errors/customAPIError");
const User_1 = __importDefault(require("../model/User"));
const authorization = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
        const message = "Unauthenticaded No Bearer";
        return next((0, customAPIError_1.createCustomError)(message, 401));
    }
    const token = authHeader.split(" ")[1];
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = yield User_1.default.findOne({ _id: payload.userId });
        if (!user) {
            return next((0, customAPIError_1.createCustomError)("Invalid JWT"));
        }
        if (user) {
            req.user = { userId: payload.userId, details: user };
        }
        next();
    }
    catch (error) {
        let message;
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            message = "Token Expired";
        }
        else {
            message = "Authentication failed invalid JWT";
        }
        return next((0, customAPIError_1.createCustomError)(message, 401));
    }
});
exports.default = authorization;
//# sourceMappingURL=authorization.js.map