import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserService } from "../modules/user/user.service";

export interface DecodedToken {
    username: string;
}

export const auth =
    (userService: UserService) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.cookies.token;
            if (!token) {
                throw new Error("Authentication failed. Token missing.");
            }
            console.log("heeeeeeeeeeeer1 ")
            const decoded = jwt.verify(token, "10") as DecodedToken;
            console.log("heeeeeeeeeeeer2 ",decoded)
            const user = await userService.getUserByUsername(decoded.username);
            console.log("heeeeeeeeeeeer3 ", user)
            if (!user) {
                throw new Error("Authentication failed. User not found.");
            }

            req.user = user;
            next();
        } catch (error) {
            res.status(401).send({ error: "Authentication failed." });
            next();
        }
    };
