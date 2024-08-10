import { DataSource } from "typeorm";
import express from "express";
import { makeUserRouter } from "./routes/user.route";
import { UserRepository } from "./modules/user/user.repository";
import { UserService } from "./modules/user/user.service";
import { errorHandler } from "./middlewares/error-handler.middleware";
import { PasswordResetTokenRepository } from "./modules/user/forgetPassword.repository";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

export const makeApp = (dataSource: DataSource) => {
    const app = express();

    app.use(cookieParser());
    app.use(express.json());

    app.use(cors({ credentials: true }));

    const userRepository = new UserRepository(dataSource);
    const passwordResetTokenRepo = new PasswordResetTokenRepository(dataSource);
    const userService = new UserService(userRepository, passwordResetTokenRepo);

    app.use("/images", express.static(path.join(__dirname, "../images")));
    app.use("/user", makeUserRouter(userService));
    app.use(errorHandler);

    return app;
};
