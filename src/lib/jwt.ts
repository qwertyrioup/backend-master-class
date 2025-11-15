import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../env";
import { NextFunction, Request, Response } from "express";
import { createError } from "./error";


export const generateToken = (userId: string, role: string) => {
    return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "3d" });
}

export const verifyToken = (token: string) => {
    return jwt.verify(token, JWT_SECRET);
}

export const decodeToken = (token: string) => {
    return jwt.decode(token) as { userId: string, role: string };
}




export const veryfyToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        const token = typeof authHeader === 'string' ? authHeader.split(" ")[1] : undefined;
        if (!token) {
            return next(createError(401, "Unauthorized"));
        }
        const decoded = verifyToken(token);
        if (!decoded) {
            return next(createError(401, "Unauthorized"));
        }

        req.user = decoded
        next();

    } catch (error) {
        console.log(error)
        next(createError(500, "Internal Server Error"));
    }
}


export const verifyTokenAndAuthorization = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        const token = typeof authHeader === 'string' ? authHeader.split(" ")[1] : undefined;
        if (!token) {
            return next(createError(401, "Unauthorized"));
        }
        const decoded = verifyToken(token);
        if (!decoded) {
            return next(createError(401, "Unauthorized"));
        }

        req.user = decoded as { userId: string, role: string };

        const { userIdOrEmail } = req.params;
        if (req.user.userId !== userIdOrEmail) {
            return next(createError(403, "You are not authorized to perform this action"));
        }
        next();
    } catch (error) {
        console.log(error);
        return next(createError(401, "Unauthorized"));
    }
}




export const verifyTokenAndCreateAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        const token = typeof authHeader === 'string' ? authHeader.split(" ")[1] : undefined;
        if (!token) {
            return next(createError(401, "Unauthorized"));
        }
        const decoded = verifyToken(token);
        if (!decoded) {
            return next(createError(401, "Unauthorized"));
        }
        req.user = decoded as { userId: string, role: string };
        const canCreateAccounts = req.user.role === "master" || req.user.role === "admin";
        if (!canCreateAccounts) {
            return next(createError(403, "You are not authorized to perform this action"));
        }
        next();
    } catch (error) {
        console.log(error);
        return next(createError(401, "Unauthorized"));
    }
}


