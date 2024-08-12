import { makeApp } from "./api";
import { AppDataSource } from "./data-source";
import { PasswordResetTokenRepository } from "./modules/user/forgetPassword.repository";
import { User } from "./modules/user/model/user.model";
import { UserRepository } from "./modules/user/user.repository";
import { UserService } from "./modules/user/user.service";
import { UserRelationRepository } from "./modules/user/userRelation.repository";

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
    const userRepo = new UserRepository(dataSource);
    const passwordResetTokenRepo = new PasswordResetTokenRepository(dataSource);
    const userRelationRepo = new UserRelationRepository(dataSource)
    const userService = new UserService(userRepo, passwordResetTokenRepo, userRelationRepo)
    const app = makeApp(dataSource, userService);
    
    app.listen(PORT, () => {
        console.log("listening on Port " + PORT);
    });

    process.on("SIGINT", function () {
        console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
        process.exit(0);
    });
});
