import { DataSource } from "typeorm";
import express from "express";
import { makeUserRouter } from "./routes/user.route";
import { errorHandler } from "./middlewares/error-handler.middleware";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { PostHandler } from "./modules/postHandler/postHandler";
import { setBaseUrl } from "./middlewares/setBaseUrl.middleware";
import swaggerUi from "swagger-ui-express";
import swaggerDocs from "./swagger-options";
import { makePostRouter } from "./routes/post.route";
import { UserHandler } from "./modules/userHandler/userHandler";
import { Server as SocketIOServer } from "socket.io";
import http from "http";
import { auth, AuthenticatedSocket, wrapExpressMiddlewareForSocketIO } from "./middlewares/auth.middleware";

export const makeApp = (
    dataSource: DataSource,
    userHandler: UserHandler,
    postHandler: PostHandler
) => {
    const app = express();

    const httpServer = http.createServer(app);
    const io = new SocketIOServer(httpServer);

    io.engine.use(wrapExpressMiddlewareForSocketIO(auth(userHandler)));

    io.on("connection", (socket) => {
        socket.on("joinThread", async (username, page = 1, limit = 10) => {
            return await userHandler.getThread(socket.request.user, username, page, limit, socket.request.base_url);
        });
    });

    app.use(cookieParser());
    app.use(express.json());

    app.use(
        cors({
            credentials: true,
            origin: [
                "http://37.32.6.230",
                "http://localhost:3000",
                "http://localhost:5173",
                "https://minus-one.dev1403.rahnemacollege.ir",
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
