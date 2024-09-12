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
import { socketAuth } from "./middlewares/socketAuth.middleware";

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

    const httpServer = http.createServer(app);
    const io = new SocketIOServer(httpServer);

    io.use(socketAuth(userHandler));

    io.on("connection", (socket) => {
        console.log("user connected");
        socket.on("joinThread", async (username, page = 1, limit = 10) => {
            const data = await userHandler.getThread(
                socket.request.user,
                username,
                page,
                limit,
                socket.request.base_url
            );

            socket.join(data.threadId);

            socket.emit("history", data);

            socket.on("newMessage", async (message) => {
                const newMessageResponse = await userHandler.newMessage(
                    socket.request.user,
                    data.threadId,
                    socket.request.base_url,
                    message
                );
                // socket.emit("newMessage", newMessageResponse);
                io.to(data.threadId).emit("newMessage", newMessageResponse);
                // socket.broadcast
                //     .to(data.threadId)
                //     .emit("newMessage", newMessageResponse);
                // socket.broadcast.emit("newMessage", newMessageResponse);
            });
        });
    });

    return httpServer;
};
