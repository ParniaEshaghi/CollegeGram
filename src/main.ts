import { makeApp } from "./api";
import { AppDataSource } from "./data-source";
import { EmailService } from "./modules/email/email.service";
import { PasswordResetTokenRepository } from "./modules/user/forgetPassword/forgetPassword.repository";
import { ForgetPasswordService } from "./modules/user/forgetPassword/forgetPassword.service";
import { PostRepository } from "./modules/post/post.repository";
import { PostService } from "./modules/post/post.service";
import { User } from "./modules/user/model/user.model";
import { UserRepository } from "./modules/user/user.repository";
import { UserService } from "./modules/user/user.service";
import { UserRelationRepository } from "./modules/user/userRelation/userRelation.repository";
import { UserRelationService } from "./modules/user/userRelation/userRelation.service";

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

    const userRepo = new UserRepository(dataSource);
    const passwordResetTokenRepo = new PasswordResetTokenRepository(dataSource);
    const emailService = new EmailService();
    const forgetPasswordService = new ForgetPasswordService(
        passwordResetTokenRepo,
        emailService
    );
    const userRelationRepo = new UserRelationRepository(dataSource);
    const userService = new UserService(
        userRepo,
        forgetPasswordService
    );
    const userRelationService = new UserRelationService(
        userRelationRepo,
        userService
    );
    const postRepo = new PostRepository(dataSource);
    const postService = new PostService(postRepo);

    const app = makeApp(
        dataSource,
        userService,
        userRelationService,
        postService
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
