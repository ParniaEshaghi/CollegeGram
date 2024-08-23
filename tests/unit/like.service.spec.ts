import { UserService } from "../../src/modules/user/user.service";
import { PostService } from "../../src/modules/post/post.service";
import {
    UnauthorizedError,
    NotFoundError,
    BadRequestError,
} from "../../src/utility/http-errors";
import { createTestDb } from "../../src/utility/test-db";
import { ServiceFactory } from "../../src/utility/service-factory";
import {
    CommentLikeService,
    PostLikeService,
} from "../../src/modules/post/like/like.service";
import { CommentService } from "../../src/modules/post/comment/comment.service";
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

describe("CommentLikeService test suite", () => {
    let serviceFactory: ServiceFactory;
    let commentLikeService: CommentLikeService;
    let userService: UserService;
    let postService: PostService;
    let commentService: CommentService;

    beforeEach(async () => {
        const dataSource = await createTestDb();
        serviceFactory = new ServiceFactory(dataSource);

        commentLikeService = serviceFactory.getCommentLikeService();
        userService = serviceFactory.getUserService();
        postService = serviceFactory.getPostService();
        commentService = serviceFactory.getCommentService();

        await userService.createUser({
            username: "test",
            email: "test@gmail.com",
            password: "test",
        });
    });

    it("should throw NotFoundError if comment is not found when liking a comment", async () => {
        const user = await userService.getUserByUsername("test");

        await expect(
            commentLikeService.likeComment(user!, randomUUID())
        ).rejects.toThrow(NotFoundError);
    });

    it("should throw BadRequestError if comment is already liked", async () => {
        const user = await userService.getUserByUsername("test");
        const post = await postService.createPost(
            user!,
            { caption: "test caption", mentions: ["test_mention"] },
            ["testfile.jpg"],
            "localhost:3000"
        );
        const comment = await commentService.createComment(user!, {
            postId: post.id,
            text: "Test comment",
        });

        await commentLikeService.likeComment(user!, comment.id);

        await expect(
            commentLikeService.likeComment(user!, comment.id)
        ).rejects.toThrow(BadRequestError);
    });

    it("should like a comment successfully if not already liked", async () => {
        const user = await userService.getUserByUsername("test");
        const post = await postService.createPost(
            user!,
            { caption: "test caption", mentions: ["test_mention"] },
            ["testfile.jpg"],
            "localhost:3000"
        );
        const comment = await commentService.createComment(user!, {
            postId: post.id,
            text: "Test comment",
        });

        const result = await commentLikeService.likeComment(user!, comment.id);

        expect(result.message).toEqual("Comment liked");
    });

    it("should throw BadRequestError if comment is not liked but trying to unlike", async () => {
        const user = await userService.getUserByUsername("test");
        const post = await postService.createPost(
            user!,
            { caption: "test caption", mentions: ["test_mention"] },
            ["testfile.jpg"],
            "localhost:3000"
        );
        const comment = await commentService.createComment(user!, {
            postId: post.id,
            text: "Test comment",
        });
        await expect(
            commentLikeService.unLikeComment(user!, comment.id)
        ).rejects.toThrow(BadRequestError);
    });

    it("should unlike a comment successfully if liked", async () => {
        const user = await userService.getUserByUsername("test");
        const post = await postService.createPost(
            user!,
            { caption: "test caption", mentions: ["test_mention"] },
            ["testfile.jpg"],
            "localhost:3000"
        );
        const comment = await commentService.createComment(user!, {
            postId: post.id,
            text: "Test comment",
        });

        await commentLikeService.likeComment(user!, comment.id);

        const result = await commentLikeService.unLikeComment(
            user!,
            comment.id
        );

        expect(result.message).toEqual("Comment unliked");
    });
});
