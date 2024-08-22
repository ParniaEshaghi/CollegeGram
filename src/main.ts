import { makeApp } from "./api";
import { AppDataSource } from "./data-source";
import { User } from "./modules/user/model/user.model";
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
        serviceFactory.getUserService(),
        serviceFactory.getUserRelationService(),
        serviceFactory.getPostService(),
        serviceFactory.getCommentService(),
        serviceFactory.getPostLikeService(),
        serviceFactory.getCommentLikeService(),
        serviceFactory.getSavedPostService()
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
