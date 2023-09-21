import { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import { createCustomError } from "../errors/customAPIError";
import asyncWrapper from "../middleware/asyncWrapper";
import User from "../model/User";
import { sendSuccessApiResponse } from "../middleware/successResp";
import client from "../util/cacheService";

interface signupObject {
    name: string;
    email: string;
    password: string;
}

interface IGetUserAuthInfoRequest extends Request {
    user: any
}

const getNewToken = async (payload: any) => {
    const isUser = payload?.userId ? true : false;
    let data: any;
    if (isUser) {
        const user: any = await User.findOne({ _id: payload.userId });
        if (user) {
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
                expiresIn: '3h',
            });
            data = { token: token };
        }
    }

    return data;
};

const refreshToken: RequestHandler = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
        const message = "Unauthenticaded No Bearer";
        return next(createCustomError(message, 401));
    }

    let data: any;
    const token = authHeader.split(" ")[1];
    try {
        const payload: string | jwt.JwtPayload | any = jwt.verify(token, process.env.JWT_SECRET);
        data = await getNewToken(payload);
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            const payload: any = jwt.decode(token, { complete: true }).payload;
            data = await getNewToken(payload);

            if (!data) {
                const message = "Authentication failed invalid JWT";
                return next(createCustomError(message, 401));
            }
        } else {
            const message = "Authentication failed invalid JWT";
            return next(createCustomError(message, 401));
        }
    }

    res.status(200).json(sendSuccessApiResponse(data, 200));

});

const registerUser: RequestHandler = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const {
        name,
        email,
        password,
    }: signupObject = req.body;

    const emailisActive = await User.findOne({ email });
    if (emailisActive) {
        const message = "Email is already registered";
        return next(createCustomError(message, 406));
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user: any = await User.create({ name, email, password: hashedPassword });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
        expiresIn: '3h',
    });
    const data = { created: true, token: token };
    res.status(201).json(sendSuccessApiResponse(data, 201));

});

const getUserById: RequestHandler = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    let result;
    const isCashed: any = await client.getItem(id);
    if (isCashed) {
        result = JSON.parse(isCashed)
    }
    else {
        result = await User.findById(id, {password:0});
        if (!result) {
            next(createCustomError('User not found', 404));
        }
        await client.setItem(id, JSON.stringify(result),{ttl:60})
    }
    res.status(200).json(sendSuccessApiResponse(result, 200));
});

const loginUser: RequestHandler = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password }: { email: string; password: string } = req.body;
    const emailExists: any = await User.findOne(
        { email },
        "name email password"
    );
    if (emailExists) {
        const isPasswordRight = await bcrypt.compare(password, emailExists.password);

        if (!isPasswordRight) {
            const message = "Invalid credentials";
            return next(createCustomError(message, 401));
        }

        const token = jwt.sign({ userId: emailExists._id }, process.env.JWT_SECRET!, {
            expiresIn: '3h',
        });
        const data = {
            canLogIn: true,
            name: emailExists.name,
            email: emailExists.email,
            token: token,
        };

        res.status(200).json(sendSuccessApiResponse(data, 200));
    }
    else {
        const message = "Invalid credentials";
        next(createCustomError(message, 401));
    }
});

const deleteUser: RequestHandler = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
        next(createCustomError('User not found', 404));
    }

    res.status(200).json(sendSuccessApiResponse({ message: 'User deleted successfully' }, 200));

});

const updatePassword: RequestHandler = asyncWrapper(async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    const { currentPassword, newPassword }: { currentPassword: string; newPassword: string } = req.body;
    const id = req.user.userId;
    const user: any = await User.findOne({ _id: id });
    if (!user) {
        const message = "There was an error finding the email";
        return next(createCustomError(message, 401));
    }

    const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordCorrect) {
        const message = "Invalid current password";
        return next(createCustomError(message, 400));
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    const data = { updatedPassword: true, email: user.email };
    res.status(200).json(sendSuccessApiResponse(data, 200));

});

const getUsers: RequestHandler = asyncWrapper(async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    let sort:any = {}
    const { page = 1, limit = 10 } = req.query;
    if(req.query.sortBy){
        const parts =  (req.query.sortBy as string).split(',');
        parts.forEach(el => {
            const sortEl = (el as string).split(':');
            sort[sortEl[0]] = sortEl[1] === 'desc'? -1: 1;
            console.log(sort)
        });
     }
     const skip = ((page as number) - 1) * (limit as number);
    const users = await User.find({},{password:0}).skip(skip).limit(limit as number).sort(sort);
    res.status(200).json(sendSuccessApiResponse(users, 200));
});

export {
    registerUser,
    loginUser,
    getUserById,
    refreshToken,
    deleteUser,
    updatePassword,
    getUsers
};
