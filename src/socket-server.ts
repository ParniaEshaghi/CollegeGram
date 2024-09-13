import { Server as SocketIOServer, Socket } from "socket.io";
import { UserHandler } from "./modules/userHandler/userHandler";
import { socketAuth } from "./middlewares/socketAuth.middleware";
import http from "http";

export const setupSocketServer = (
    httpServer: http.Server,
    userHandler: UserHandler
) => {
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

    return io;
};
