import { EmailService } from "../../src/modules/email/email.service";
import { PasswordResetTokenRepository } from "../../src/modules/user/forgetPassword/forgetPassword.repository";
import { ForgetPasswordService } from "../../src/modules/user/forgetPassword/forgetPassword.service";
import { UserRepository } from "../../src/modules/user/user.repository";
import { UserService } from "../../src/modules/user/user.service";
import { UserRelationRepository } from "../../src/modules/user/userRelation/userRelation.repository";
import { UserRelationService } from "../../src/modules/user/userRelation/userRelation.service";
import {
    BadRequestError,
    HttpError,
    NotFoundError,
} from "../../src/utility/http-errors";
import { createTestDb } from "../../src/utility/test-db";

describe("User relation service test suite", () => {
    let userRepo: UserRepository;
    let passwordResetTokenRepo: PasswordResetTokenRepository;
    let forgetPasswordService: ForgetPasswordService;
    let userRelationRepo: UserRelationRepository;
    let userService: UserService;
    let emailService: EmailService;
    let userRelationService: UserRelationService;

    beforeEach(async () => {
        const dataSource = await createTestDb();
        userRepo = new UserRepository(dataSource);
        passwordResetTokenRepo = new PasswordResetTokenRepository(dataSource);
        forgetPasswordService = new ForgetPasswordService(
            passwordResetTokenRepo,
            emailService
        );
        userRelationRepo = new UserRelationRepository(dataSource);
        emailService = new EmailService();
        userService = new UserService(userRepo, forgetPasswordService);
        userRelationService = new UserRelationService(
            userRelationRepo,
            userService
        );

        await userService.createUser({
            username: "test",
            email: "test@gmail.com",
            password: "test",
        });

        await userService.createUser({
            username: "follow_test",
            email: "follow_test@gmail.com",
            password: "follow_test",
        });
    });

    describe("Follow", () => {
        it("should follow a user", async () => {
            const user = await userService.getUserByUsername("test");
            const response = await userRelationService.follow(
                user!,
                "follow_test"
            );
            const follower = await userService.getUserByUsername("test");
            const following = await userService.getUserByUsername(
                "follow_test"
            );
            expect(response.message).toBe("User followed");
            expect(follower!.following_count).toBe(1);
            expect(following!.follower_count).toBe(1);
        });

        it("should fail to follow a user if user is already followed", async () => {
            await userRelationService.follow(
                (await userService.getUserByUsername("test"))!,
                "follow_test"
            );
            expect(
                userRelationService.follow(
                    (await userService.getUserByUsername("test"))!,
                    "follow_test"
                )
            ).rejects.toThrow(new BadRequestError());
        });

        it("should fail to follow someone that does not exist", async () => {
            expect(
                userRelationService.follow(
                    (await userService.getUserByUsername("test"))!,
                    "wrong_test"
                )
            ).rejects.toThrow(new NotFoundError());
        });
    });

    describe("Unfollow", () => {
        it("should unfollow a user", async () => {
            await userRelationService.follow(
                (await userService.getUserByUsername("test"))!,
                "follow_test"
            );
            const user = await userService.getUserByUsername("test");
            const response = await userRelationService.unfollow(
                user!,
                "follow_test"
            );
            const follower = await userService.getUserByUsername("test");
            const following = await userService.getUserByUsername(
                "follow_test"
            );
            expect(response.message).toBe("User unfollowed");
            expect(follower!.following_count).toBe(0);
            expect(following!.follower_count).toBe(0);
        });

        it("should fail to unfollow a user if user is already not followed", async () => {
            expect(
                userRelationService.unfollow(
                    (await userService.getUserByUsername("test"))!,
                    "follow_test"
                )
            ).rejects.toThrow(new BadRequestError());
        });

        it("should fail to unfollow someone that does not exist", async () => {
            expect(
                userRelationService.unfollow(
                    (await userService.getUserByUsername("test"))!,
                    "wrong_test"
                )
            ).rejects.toThrow(new NotFoundError());
        });
    });
});
