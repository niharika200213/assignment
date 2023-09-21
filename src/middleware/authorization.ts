import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { createCustomError } from "../errors/customAPIError";
import User from "../model/User";

interface IGetUserAuthInfoRequest extends Request {
    user: object 
  }

const authorization = async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
        const message = "Unauthenticaded No Bearer";
        return next(createCustomError(message, 401));
    }

    const token = authHeader.split(" ")[1];
    try {
        const payload: string | jwt.JwtPayload | any = jwt.verify(token, process.env.JWT_SECRET);
        const user: any = await User.findOne({_id: payload.userId });

        if (!user) {
            return next(createCustomError("Invalid JWT"));
        }

        if (user) {
            req.user = { userId: payload.userId, details: user };
        }
        next();
    } catch (error) {
        let message: string;
        if (error instanceof jwt.TokenExpiredError) {
            message = "Token Expired";
        } else {
            message = "Authentication failed invalid JWT";
        }

        return next(createCustomError(message, 401));
    }
};


export default authorization;
