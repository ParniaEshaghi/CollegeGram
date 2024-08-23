import { UserService } from "../../src/modules/user/user.service";
import {
    BadRequestError,
    NotFoundError,
} from "../../src/utility/http-errors";
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

    describe("User Profile", () => {
        it("should get user profile with follow status", async () => {
            const user = await userService.getUserByUsername("test");
            await userRelationService.follow(user!, "follow_test");

            const profile = await userRelationService.userProfile(
                user!,
                "follow_test",
                "http://localhost:3000"
            );

            expect(profile.username).toBe("follow_test");
            expect(profile.follow_status).toBe(true);
        });

        it("should fail to get user profile if user does not exist", async () => {
            const user = await userService.getUserByUsername("test");

            await expect(
                userRelationService.userProfile(
                    user!,
                    "non_existent_user",
                    "http://localhost:3000"
                )
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe("Follower and Following Lists", () => {
        it("should get follower list", async () => {
            const user = await userService.getUserByUsername("test");
            await userRelationService.follow(user!, "follow_test");

            const followers = await userRelationService.followerList(
                user!,
                "follow_test",
                1,
                10,
                "http://localhost:3000"
            );

            expect(followers?.data.length).toBeGreaterThan(0);
        });

        it("should get following list", async () => {
            const user = await userService.getUserByUsername("test");
            await userRelationService.follow(user!, "follow_test");

            const followings = await userRelationService.followeingList(
                user!,
                "test",
                1,
                10,
                "http://localhost:3000"
            );

            expect(followings?.data.length).toBeGreaterThan(0);
        });

        it("should fail to get follower list if user does not exist", async () => {
            const user = await userService.getUserByUsername("test");

            await expect(
                userRelationService.followerList(
                    user!,
                    "non_existent_user",
                    1,
                    10,
                    "http://localhost:3000"
                )
            ).rejects.toThrow(NotFoundError);
        });

        it("should fail to get following list if user does not exist", async () => {
            const user = await userService.getUserByUsername("test");

            await expect(
                userRelationService.followeingList(
                    user!,
                    "non_existent_user",
                    1,
                    10,
                    "http://localhost:3000"
                )
            ).rejects.toThrow(NotFoundError);
        });
    });
});
