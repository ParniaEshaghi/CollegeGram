import { DataSource } from "typeorm";
import express from "express";
import { makeUserRouter } from "./routes/user.route";
import { UserService } from "./modules/userHandler/user/user.service";
import { errorHandler } from "./middlewares/error-handler.middleware";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { PostHandler } from "./modules/postHandler/postHandler";
import { setBaseUrl } from "./middlewares/setBaseUrl.middleware";
import { UserRelationService } from "./modules/userHandler/userRelation/userRelation.service";
import { SavedPostService } from "./modules/userHandler/savedPost/savedPost.service";
import swaggerUi from "swagger-ui-express";
import swaggerDocs from "./swagger-options";
import { makePostRouter } from "./routes/post.route";
import { UserHandler } from "./modules/userHandler/userHandler";

export const makeApp = (
    dataSource: DataSource,
    userHandler: UserHandler,
    postHandler: PostHandler
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
                "http://collegegram.outofmatrixxx.ir",
            ],
            exposedHeaders: ["set-cookie", "ajax_redirect"],
            preflightContinue: true,
            methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
            optionsSuccessStatus: 200,
        })
    );

    app.use(setBaseUrl);

    app.use("/api/images", express.static(path.join(__dirname, "../images")));
    app.use("/api/user", makeUserRouter(userHandler));
    app.use("/api/post", makePostRouter(userHandler, postHandler));

    app.use(errorHandler);

    app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

    return app;
};
