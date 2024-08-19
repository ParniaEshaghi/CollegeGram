import { UserService } from "../../src/modules/user/user.service";
import { BadRequestError, NotFoundError } from "../../src/utility/http-errors";
import { createTestDb } from "../../src/utility/test-db";
import { ServiceFactory } from "../../src/utility/service-factory";
import { UserRelationService } from "../../src/modules/user/userRelation/userRelation.service";

describe("User relation service test suite", () => {
    let serviceFactory: ServiceFactory;
    let userService: UserService;
    let userRelationService: UserRelationService;

    beforeEach(async () => {
        const dataSource = await createTestDb();
        serviceFactory = new ServiceFactory(dataSource);

        userService = serviceFactory.getUserService();
        userRelationService = serviceFactory.getUserRelationService();

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
