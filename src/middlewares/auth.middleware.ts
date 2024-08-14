import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserService } from "../modules/user/user.service";
import { HttpError } from "../utility/http-errors";

export interface DecodedToken {
    username: string;
}

export const auth =
    (userService: UserService) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.cookies.token;
            if (!token) {
                throw new HttpError(
                    401,
                    "Authentication failed. Token missing."
                );
            }

            const decoded = jwt.verify(token, "10") as DecodedToken;
            const user = await userService.getUserByUsername(decoded.username);

            if (!user) {
                throw new HttpError(
                    401,
                    "Authentication failed. User not found."
                );
            }

            req.user = user;
            next();
        } catch (error) {
            res.status(401).send({ error: "Authentication failed." });
        }
    };
