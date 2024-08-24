import { UserService } from "../../src/modules/userHandler/user/user.service";
import { PostService } from "../../src/modules/postHandler/post/post.service";
import {
    UnauthorizedError,
    NotFoundError,
    BadRequestError,
} from "../../src/utility/http-errors";
import { createTestDb } from "../../src/utility/test-db";
import { ServiceFactory } from "../../src/utility/service-factory";
import { PostLikeService } from "../../src/modules/postHandler/postLike/postLike.service";
import { randomUUID } from "crypto";

describe("PostLikeService test suite", () => {
    let serviceFactory: ServiceFactory;
    let postLikeService: PostLikeService;
    let userService: UserService;
    let postService: PostService;

    beforeEach(async () => {
        const dataSource = await createTestDb();
        serviceFactory = new ServiceFactory(dataSource);

        postLikeService = serviceFactory.getPostLikeService();
        userService = serviceFactory.getUserService();
        postService = serviceFactory.getPostService();

        await userService.createUser({
            username: "test",
            email: "test@gmail.com",
            password: "test",
        });
    });

    it("should throw UnauthorizedError if user is not provided when liking a post", async () => {
        await expect(
            postLikeService.likePost(null!, "test-post-id")
        ).rejects.toThrow(UnauthorizedError);
    });

    it("should throw NotFoundError if post is not found when liking a post", async () => {
        const user = await userService.getUserByUsername("test");

        await expect(
            postLikeService.likePost(user!, randomUUID())
        ).rejects.toThrow(NotFoundError);
    });

    it("should throw BadRequestError if post is already liked", async () => {
        const user = await userService.getUserByUsername("test");
        const post = await postService.createPost(
            user!,
            { caption: "test caption", mentions: ["test_mention"] },
            ["testfile.jpg"],
            "localhost:3000"
        );
        await postLikeService.likePost(user!, post.id);
        await expect(postLikeService.likePost(user!, post.id)).rejects.toThrow(
            BadRequestError
        );
    });

    it("should like a post successfully if not already liked", async () => {
        const user = await userService.getUserByUsername("test");
        const post = await postService.createPost(
            user!,
            { caption: "test caption", mentions: ["test_mention"] },
            ["testfile.jpg"],
            "localhost:3000"
        );

        const result = await postLikeService.likePost(user!, post.id);

        expect(result.message).toEqual("Post liked");
    });

    it("should throw BadRequestError if post is not liked but trying to unlike", async () => {
        const user = await userService.getUserByUsername("test");
        const post = await postService.createPost(
            user!,
            { caption: "test caption", mentions: ["test_mention"] },
            ["testfile.jpg"],
            "localhost:3000"
        );

        await expect(
            postLikeService.unLikePost(user!, post.id)
        ).rejects.toThrow(BadRequestError);
    });

    it("should unlike a post successfully if liked", async () => {
        const user = await userService.getUserByUsername("test");
        const post = await postService.createPost(
            user!,
            { caption: "test caption", mentions: ["test_mention"] },
            ["testfile.jpg"],
            "localhost:3000"
        );

        await postLikeService.likePost(user!, post.id);
        const result = await postLikeService.unLikePost(user!, post.id);

        expect(result.message).toEqual("Post unliked");
    });
});