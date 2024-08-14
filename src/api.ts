import { DataSource } from "typeorm";
import express from "express";
import { makeUserRouter } from "./routes/user.route";
import { UserService } from "./modules/user/user.service";
import { errorHandler } from "./middlewares/error-handler.middleware";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { UserRelationService } from "./modules/user/userRelation/userRelation.service";
import { makePostRouter } from "./routes/post.route";
import { PostService } from "./modules/post/post.service";

export const makeApp = (
    dataSource: DataSource,
    userService: UserService,
    userRelationService: UserRelationService,
    postService: PostService
) => {
    const app = express();

    app.use(cookieParser());
    app.use(express.json());
    app.use(cors());

    app.use("/api/images", express.static(path.join(__dirname, "../images")));
    app.use("/api/user", makeUserRouter(userService, userRelationService));
    app.use("/api/post", makePostRouter(postService, userService));

    app.use(errorHandler);

    return app;
};
