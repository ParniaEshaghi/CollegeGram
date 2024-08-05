import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserService } from "../modules/user/user.service";

interface DecodedToken {
    username: string;
}

export const auth =
    (userService: UserService) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.header("Authorization")?.replace("Bearer ", "");
            if (!token) {
                throw new Error("Authentication failed. Token missing.");
            }

            const decoded = jwt.verify(token, "10") as DecodedToken;
            const user = await userService.getUserByUsername(decoded.username);

            if (!user) {
                throw new Error("Authentication failed. User not found.");
            }

            req.user = user;
            req.token = token;
            next();
        } catch (error) {
            res.status(401).send({ error: "Authentication failed." });
        }
    };
