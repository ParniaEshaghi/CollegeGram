import { makeApp } from "./api";
import { AppDataSource } from "./data-source";
import { PostLikeSubscriber } from "./modules/userHandler/notification/subscribers/postLike.subscriber";
import { User } from "./modules/userHandler/user/model/user.model";
import { ServiceFactory } from "./utility/service-factory";

const PORT = 3000;

declare global {
    namespace Express {
        interface Request {
            user: User;
            token: string;
            base_url: string;
        }
    }
}

const run = async () => {
    const dataSource = await AppDataSource.initialize();
    const serviceFactory = new ServiceFactory(dataSource);

    const app = makeApp(
        dataSource,
        serviceFactory.getUserHandler(),
        serviceFactory.getPostHandler()
    );

    app.listen(PORT, () => {
        console.log("Listening on Port " + PORT);
    });

    process.on("SIGINT", () => {
        console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
        process.exit(0);
    });
};

run();
