import { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import { createCustomError } from "../errors/customAPIError";
import asyncWrapper from "../middleware/asyncWrapper";
import User from "../model/User";
import { sendSuccessApiResponse } from "../middleware/successResp";
import client from "../util/cacheService";

// Define the object used for user registration
interface signupObject {
    name: string;
    email: string;
    password: string;
}

// interface for jwt auth
interface IGetUserAuthInfoRequest extends Request {
    user: any
}

// function to generate new token
const getNewToken = async (payload: any) => {
    const isUser = payload?.userId ? true : false;
    let data: any;
    // check if user exists
    if (isUser) {
        const user: any = await User.findOne({ _id: payload.userId });
        if (user) {
            // generate jwt token
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
                expiresIn: '3h',
            });
            data = { token: token };
        }
    }

    return data;
};

// refresh token handler
const refreshToken: RequestHandler = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {

    //get auth header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
        const message = "Unauthenticaded No Bearer";
        return next(createCustomError(message, 401));
    }

    let data: any;
    const token = authHeader.split(" ")[1];
    try {

        //verify old token and generate new
        const payload: string | jwt.JwtPayload | any = jwt.verify(token, process.env.JWT_SECRET);
        data = await getNewToken(payload);
    } catch (error) {

        //jwt errors
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

// handler to register users
const registerUser: RequestHandler = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const {
        name,
        email,
        password,
    }: signupObject = req.body;

    const emailisActive = await User.findOne({ email });

    //check if email already exists
    if (emailisActive) {
        const message = "Email is already registered";
        return next(createCustomError(message, 406));
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //create user
    const user: any = await User.create({ name, email, password: hashedPassword });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
        expiresIn: '3h',
    });
    const data = { created: true, token: token };
    res.status(201).json(sendSuccessApiResponse(data, 201));

});

// get one user by id
const getUserById: RequestHandler = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    let result;

    //check if user data exists in cache
    const isCashed: any = await client.getItem(id);
    if (isCashed) {
        result = JSON.parse(isCashed)
    }
    else {

        //get user data when not in cache
        result = await User.findById(id, {password:0});
        if (!result) {
            next(createCustomError('User not found', 404));
        }

        //set user data in cache
        await client.setItem(id, JSON.stringify(result),{ttl:60})
    }
    res.status(200).json(sendSuccessApiResponse(result, 200));
});

// login handler
const loginUser: RequestHandler = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password }: { email: string; password: string } = req.body;
    const emailExists: any = await User.findOne(
        { email },
        "name email password"
    );
    if (emailExists) {

        //compare password
        const isPasswordRight = await bcrypt.compare(password, emailExists.password);

        if (!isPasswordRight) {
            const message = "Invalid credentials";
            return next(createCustomError(message, 401));
        }

        //generate token
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

//delete user through user id handler
const deleteUser: RequestHandler = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    //check if user exists
    if (!user) {
        next(createCustomError('User not found', 404));
    }

    res.status(200).json(sendSuccessApiResponse({ message: 'User deleted successfully' }, 200));

});

//update password handler
const updatePassword: RequestHandler = asyncWrapper(async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    const { currentPassword, newPassword }: { currentPassword: string; newPassword: string } = req.body;
    const id = req.user.userId;

    //check if user exists
    const user: any = await User.findOne({ _id: id });
    if (!user) {
        const message = "There was an error finding the email";
        return next(createCustomError(message, 401));
    }

    //check current password 
    const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordCorrect) {
        const message = "Invalid current password";
        return next(createCustomError(message, 400));
    }

    //hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    const data = { updatedPassword: true, email: user.email };
    res.status(200).json(sendSuccessApiResponse(data, 200));

});

//get all users
const getUsers: RequestHandler = asyncWrapper(async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    
    //object for sorting
    let sort:any = {}
    const { page = 1, limit = 10 } = req.query;

    // exmaple ?sortBy=name:asc,email:desc&page=3&limit=2
    //implement sorting
    if(req.query.sortBy){
        const parts =  (req.query.sortBy as string).split(',');
        parts.forEach(el => {
            const sortEl = (el as string).split(':');
            sort[sortEl[0]] = sortEl[1] === 'desc'? -1: 1;
        });
     }

     // implement paging
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
