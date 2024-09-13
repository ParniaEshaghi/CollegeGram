import { Server as SocketIOServer, Socket } from "socket.io";
import { UserHandler } from "./modules/userHandler/userHandler";
import { socketAuth } from "./middlewares/socketAuth.middleware";
import http from "http";
import { NotFoundError } from "./utility/http-errors";

export const setupSocketServer = (
    httpServer: http.Server,
    userHandler: UserHandler
) => {
    const io = new SocketIOServer(httpServer);

    io.use(socketAuth(userHandler));

    io.on("connection", (socket) => {
        console.log("user connected");

        socket.on("joinThread", async (username, page = 1, limit = 10) => {
            try {
                const data = await userHandler.getThread(
                    socket.request.user,
                    username,
                    page,
                    limit,
                    socket.request.base_url
                );

                const rooms = Array.from(socket.rooms);
                rooms.forEach((room) => {
                    if (room !== socket.id) {
                        socket.leave(room);
                    }
                });

                socket.join(data.threadId);
                socket.emit("history", data);

                socket.on("newMessage", async (message) => {
                    try {
                        const newMessageResponse = await userHandler.newMessage(
                            socket.request.user,
                            data.threadId,
                            socket.request.base_url,
                            message
                        );
                        // socket.emit("newMessage", newMessageResponse);
                        io.to(data.threadId).emit(
                            "newMessage",
                            newMessageResponse
                        );
                        // socket.broadcast
                        //     .to(data.threadId)
                        //     .emit("newMessage", newMessageResponse);
                        // socket.broadcast.emit("newMessage", newMessageResponse);
                    } catch (error) {
                        socket.emit("error", {
                            message: "Failed to send message.",
                        });
                    }
                });
            } catch (error) {
                if (error instanceof NotFoundError) {
                    socket.emit("error", {
                        message: "User not found",
                        status: 404,
                    });
                } else {
                    socket.emit("error", {
                        message: "An unexpected error occurred",
                        status: 500,
                    });
                }
            }
        });
    });

    return io;
};
