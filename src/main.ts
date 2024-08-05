import { makeApp } from "./api";
import { AppDataSource } from "./data-source";
import { User } from "./modules/user/model/user.model";

const PORT = 3000;

declare global {
    namespace Express {
        interface Request {
            user: User;
            token: string;
        }
    }
}

AppDataSource.initialize().then((dataSource) => {
    const app = makeApp(dataSource);
    app.listen(PORT, () => {
        console.log("listening on Port " + PORT);
    });
});
