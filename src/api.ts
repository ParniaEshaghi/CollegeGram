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
import { setBaseUrl } from "./middlewares/setBaseUrl.middleware";
import swaggerUi from "swagger-ui-express";
import swaggerDocs from "./swagger-options";
import { CommentService } from "./modules/post/comment/comment.service";
import { PostLikeService } from "./modules/post/like/like.service";
import { SavedPostService } from "./modules/user/savedPost/savedPost.service";

export const makeApp = (
    dataSource: DataSource,
    userService: UserService,
    userRelationService: UserRelationService,
    postService: PostService,
    commentService: CommentService,
    postLikeService: PostLikeService,
    savedPostService: SavedPostService
) => {
    const app = express();

    app.use(cookieParser());
    app.use(express.json());

    app.use(
        cors({
            credentials: true,
            origin: [
                "http://37.32.6.230",
                "http://localhost:3000",
                "http://localhost:5173",
            ],
            exposedHeaders: ["set-cookie", "ajax_redirect"],
            preflightContinue: true,
            methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
            optionsSuccessStatus: 200,
        })
    );

    app.use(setBaseUrl);

    app.use("/api/images", express.static(path.join(__dirname, "../images")));
    app.use(
        "/api/user",
        makeUserRouter(userService, userRelationService, savedPostService)
    );
    app.use(
        "/api/post",
        makePostRouter(
            postService,
            userService,
            commentService,
            postLikeService
        )
    );

    app.use(errorHandler);

    app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

    return app;
};
