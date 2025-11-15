import { NextFunction, Request, Response } from "express";
import User from "../models/User";
import { createError } from "../lib/error";
import { comparePassword, hashPassword } from "../lib/helpers";
import { isValidObjectId } from "mongoose";
import { generateToken } from "../lib/jwt";





export const createUser = async(req: Request, res: Response, next: NextFunction) => {
    try {

        let targetUserRole: 'admin' | 'user' = 'user';


        const user = req.user as { userId: string, role: string };

        if (user.role === 'admin') {
            targetUserRole = 'user';
        }
        if (user.role === 'master') {
            targetUserRole = 'admin';
        }
        const { firstName, lastName, email, password } = req.body;


        const foundUser = await User.findOne({ email });
        if (foundUser) {
            return next(createError(400, "User already exists"));

        }

        const hashedPassword = await hashPassword(password);

        const newUser = new User({ firstName, lastName, email, password: hashedPassword, role: targetUserRole });
        const savedUser = await newUser.save();
        if (!savedUser) {
            return next(createError(500, "Failed to create user"));
        }

        const {password:_, ...others} = savedUser.toObject();
        res.status(201).json({
            success: true,
            status: 201,
            message: "User created successfully!",
            data: others,
        });
    } catch (error) {
        console.log(error)
        next(createError(500, "Internal Server Error"));
    }
}


export const getUser = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {userIdOrEmail} = req.params;

        if (!userIdOrEmail) {
            return next(createError(400, "User ID or Email is required"));
        }

        let query: any = {};

        if (isValidObjectId(userIdOrEmail.trim())) {
            query._id = userIdOrEmail.trim();
        } else {
            query.email = userIdOrEmail.trim();
        }


        const foundUser = await User.findOne(query).select("-password");
        if (!foundUser) {
            return next(createError(404, "User not found"));
        }
        res.status(200).json({
            success: true,
            status: 200,
            message: "User found successfully!",
            data: foundUser,
        });
    } catch (error) {
        console.log(error)
        next(createError(500, "Internal Server Error"));
    }
}




export const getAllUsers = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await User.find().select("-password");
        if (!users) {
            return next(createError(404, "No users found"));
        }
        res.status(200).json({
            success: true,
            status: 200,
            message: "Users fetched successfully!",
            data: users,
        });
    } catch (error) {
        console.log(error)
        next(createError(500, "Internal Server Error"));
    }
}



type UpdateDetails = {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
}

type userIdOrEmailQuery = {
    _id?: string;
    email?: string;
}

export const updateUser = async(req: Request, res: Response, next: NextFunction) => {


    try {
        const {userIdOrEmail} = req.params;
        if (!userIdOrEmail) {
            return next(createError(400, "User ID or Email is required"));
        }
        let query: userIdOrEmailQuery = {};
        if (isValidObjectId(userIdOrEmail.trim())) {
            query._id = userIdOrEmail.trim();
        } else {
            query.email = userIdOrEmail.trim();
        }
        
        const foundUser = await User.findOne(query);
        if (!foundUser) {
            return next(createError(404, "User not found"));
        }

        let updateDetails: UpdateDetails = {};

        const {firstName, lastName, email, password} = req.body;

        if (firstName) {
            updateDetails.firstName = firstName;
        }
        if (lastName) {
            updateDetails.lastName = lastName;
        }
        if (email) {
            updateDetails.email = email;
        }
        if (password) {
            updateDetails.password = await hashPassword(password);
        }


        const updatedUser = await User.findOneAndUpdate(query, updateDetails, { new: true }).select("-password");
        if (!updatedUser) {
            return next(createError(500, "Failed to update user"));
        }
        res.status(200).json({
            success: true,
            status: 200,
            message: "User updated successfully!",
            data: updatedUser,
        });
    } catch (error) {
        console.log(error)
        next(createError(500, "Internal Server Error"));
    }
}



export const deleteUser = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user as { userId: string, role: string };
        const {userIdOrEmail} = req.params;
        if (!userIdOrEmail) {
            return next(createError(400, "User ID or Email is required"));
        }

        let query: userIdOrEmailQuery = {};
        if (isValidObjectId(userIdOrEmail.trim())) {
            query._id = userIdOrEmail.trim();
        } else {
            query.email = userIdOrEmail.trim();
        }
        const foundUser = await User.findOne(query);
        if (!foundUser) {
            return next(createError(404, "User not found"));
        }

        const isAdmin = user.role === "admin";
        const isUser = user.role === "user";
        const foundUserRole = foundUser.role;
        
        // Users cannot delete anyone
        if (isUser) {
            return next(createError(403, "You are not authorized to delete this user"));
        }
        
        // Admins cannot delete other admins or masters
        if (isAdmin && (foundUserRole === "admin" || foundUserRole === "master")) {
            return next(createError(403, "You are not authorized to delete this user"));
        }
        
        // Prevent users from deleting themselves (optional safety check)
        if (user.userId === String(foundUser._id)) {
            return next(createError(403, "You cannot delete yourself"));
        }
  





        const deletedUser = await User.findOneAndDelete(query);
        if (!deletedUser) {
            return next(createError(500, "Failed to delete user"));
        }
        res.status(200).json({
            success: true,
            status: 200,
            message: "User deleted successfully!",
            data: deletedUser,
        });
    } catch (error) {
        console.log(error)
        next(createError(500, "Internal Server Error"));
    }
}



export const loginUser = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, password} = req.body;
        const foundUser = await User.findOne({email});
        if (!foundUser) {
            return next(createError(404, "User not found"));
        }
        const isPasswordCorrect = await comparePassword(password, foundUser.password);
        if (!isPasswordCorrect) {
            return next(createError(400, "Invalid password"));
        }
        const {_id, role} = foundUser;
        const token = generateToken(String(_id), role);
        const {password:_, ...others} = foundUser.toObject();
        res.status(200).json({
            success: true,
            status: 200,
            message: "User logged in successfully!",
            data: {
                token,
                ...others,
            },
        });
    }
 catch (error) {
    console.log(error)
    next(createError(500, "Internal Server Error"));
}
}


