import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserService } from "../modules/user/user.service";
import { AuthenticationFailError, HttpError } from "../utility/http-errors";

export interface DecodedToken {
    username: string;
}

export const auth =
    (userService: UserService) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.cookies.token;
            if (!token) {
                throw new AuthenticationFailError();
            }

            const decoded = jwt.verify(token, "10") as DecodedToken;
            const user = await userService.getUserByUsername(decoded.username);

            if (!user) {
                throw new AuthenticationFailError();
            }

            req.user = user;
            next();
        } catch (error) {
            res.status(401).send({ error: "Authentication failed." });
        }
    };
