import { Server as SocketIOServer, Socket } from "socket.io";
import { UserHandler } from "./modules/userHandler/userHandler";
import { socketAuth } from "./middlewares/socketAuth.middleware";
import http from "http";
import { NotFoundError } from "./utility/http-errors";
import { saveImage } from "./utility/save-image";
import { socketSetBaseUrl } from "./middlewares/socketSetBaseUrl.middleware";

export const setupSocketServer = (
    httpServer: http.Server,
    userHandler: UserHandler
) => {
    const io = new SocketIOServer(httpServer, {
        path: "/api/socket.io",
        cors: {
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
        },
    });

    io.use(socketAuth(userHandler));
    io.use(socketSetBaseUrl);

    io.on("connection", (socket) => {
        let roomId: string;

        socket.on("join", async (username) => {
            try {
                const threadId = await userHandler.getThread(
                    socket.request.user,
                    username
                );

                const rooms = Array.from(socket.rooms);
                rooms.forEach((room) => {
                    if (room !== socket.id) {
                        socket.leave(room);
                    }
                });

                roomId = threadId;
                socket.join(roomId);

                io.to(roomId).emit("connection", {
                    message: "User has joined the thread",
                    // status: 200,
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

        socket.on("history", async (page = 1, limit = 10) => {
            try {
                const data = await userHandler.getThreadHistory(
                    roomId,
                    page,
                    limit,
                    socket.request.base_url
                );

                socket.emit("history", data);
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

        socket.on(
            "newMessage",
            async (data: { text?: string; image?: string }) => {
                try {
                    if (data.image) {
                        const imageBuffer = Buffer.from(data.image, "base64");
                        const image = await saveImage(imageBuffer);

                        const newImageMessage = await userHandler.newMessage(
                            socket.request.user,
                            roomId,
                            socket.request.base_url,
                            undefined,
                            image
                        );

                        io.to(roomId).emit("newMessage", newImageMessage);
                    } else if (data.text) {
                        const newMessageResponse = await userHandler.newMessage(
                            socket.request.user,
                            roomId,
                            socket.request.base_url,
                            data.text,
                            undefined
                        );

                        io.to(roomId).emit("newMessage", newMessageResponse);
                    } else {
                        socket.emit("error", {
                            message:
                                "Invalid message format. Must contain either text or image.",
                            status: 500,
                        });
                    }
                } catch (error) {
                    console.error("Error in newMessage handler:", error);
                    socket.emit("error", {
                        message: "Failed to send message.",
                        // error: error,
                        status: 500,
                    });
                }
            }
        );

        socket.on("disconnect", (reason) => {
            if (roomId) {
                socket.leave(roomId);
                io.to(roomId).emit("userDisconnected", {
                    message: "User has left the thread",
                    // status: 200,
                });
            }
        });
    });

    return io;
};
