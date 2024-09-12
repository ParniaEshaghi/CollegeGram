import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserService } from "../modules/userHandler/user/user.service";
import { AuthenticationFailError, HttpError } from "../utility/http-errors";
import { UserHandler } from "../modules/userHandler/userHandler";
import { Server as SocketIOServer, Socket } from "socket.io";
import { User } from "../modules/userHandler/user/model/user.model";
import { IncomingMessage } from "http";

export interface DecodedToken {
    username: string;
}

const getToken = (req: Request): string | undefined => {
    if (req.cookies.token) {
        return req.cookies.token;
    }

    if (req.headers["authorization"]) {
        return req.headers["authorization"].split(" ")[1];
    }

    return undefined;
};

export const auth =
    (userHandler: UserHandler) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = getToken(req);

            if (!token) {
                throw new AuthenticationFailError();
            }
            const decoded = jwt.verify(token, "10") as DecodedToken;
            const user = await userHandler.getUserByUsername(decoded.username);
            if (!user) {
                throw new AuthenticationFailError();
            }

            req.user = user;
            next();
        } catch (error) {
            res.status(401).send({ error: "Authentication failed." });
        }
    };

export interface AuthenticatedSocket extends Socket {
    request: IncomingMessage & { user: User }; // Add the `user` property
}

export const wrapExpressMiddlewareForSocketIO =
    (auth: (req: Request, res: Response, next: NextFunction) => void) =>
    (socket: AuthenticatedSocket, next: NextFunction) => {
        auth(socket.request, {} as Response, next);
    };
