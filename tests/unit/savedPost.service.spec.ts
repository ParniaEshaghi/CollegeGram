import { SavedPostService } from "../../src/modules/user/savedPost/savedPost.service";
import { UserService } from "../../src/modules/user/user.service";
import { PostService } from "../../src/modules/post/post.service";
import {
    NotFoundError,
    BadRequestError,
} from "../../src/utility/http-errors";
import { createTestDb } from "../../src/utility/test-db";
import { ServiceFactory } from "../../src/utility/service-factory";
import { randomUUID } from "crypto";

describe("SavedPostService test suite", () => {
    let serviceFactory: ServiceFactory;
    let savedPostService: SavedPostService;
    let userService: UserService;
    let postService: PostService;

    beforeEach(async () => {
        const dataSource = await createTestDb();
        serviceFactory = new ServiceFactory(dataSource);

        savedPostService = serviceFactory.getSavedPostService();
        userService = serviceFactory.getUserService();
        postService = serviceFactory.getPostService();

        await userService.createUser({
            username: "test",
            email: "test@gmail.com",
            password: "test",
        });
    });

    it("should throw NotFoundError if post is not found when checking save status", async () => {
        const user = await userService.getUserByUsername("test");
        jest.spyOn(postService, "getPost").mockResolvedValue(null);

        await expect(
            savedPostService.getPostSaveStatus(user!, randomUUID())
        ).rejects.toThrow(NotFoundError);
    });

    it("should return false if post is not saved by the user", async () => {
        const user = await userService.getUserByUsername("test");
        const post = await postService.createPost(
            user!,
            { caption: "test caption", mentions: ["test_mention"] },
            ["testfile.jpg"],
            "localhost:3000"
        );

        const saveStatus = await savedPostService.getPostSaveStatus(
            user!,
            post.id
        );

        expect(saveStatus).toEqual(false);
    });

    it("should save a post successfully if not already saved", async () => {
        const user = await userService.getUserByUsername("test");
        const post = await postService.createPost(
            user!,
            { caption: "test caption", mentions: ["test_mention"] },
            ["testfile.jpg"],
            "localhost:3000"
        );

        const result = await savedPostService.savePost(user!, post.id);

        expect(result.message).toEqual("Post saved");
    });

    it("should throw BadRequestError if post is already saved", async () => {
        const user = await userService.getUserByUsername("test");
        const post = await postService.createPost(
            user!,
            { caption: "test caption", mentions: ["test_mention"] },
            ["testfile.jpg"],
            "localhost:3000"
        );
 
        await savedPostService.savePost(user!, post.id);

        await expect(savedPostService.savePost(user!, post.id)).rejects.toThrow(
            BadRequestError
        );
    });

    it("should throw BadRequestError if post is not saved but trying to unsave", async () => {
        const user = await userService.getUserByUsername("test");
        const post = await postService.createPost(
            user!,
            { caption: "test caption", mentions: ["test_mention"] },
            ["testfile.jpg"],
            "localhost:3000"
        );

        await expect(
            savedPostService.unSavePost(user!, post.id)
        ).rejects.toThrow(BadRequestError);
    });

    it("should unsave a post successfully if saved", async () => {
        const user = await userService.getUserByUsername("test");
        const post = await postService.createPost(
            user!,
            { caption: "test caption", mentions: ["test_mention"] },
            ["testfile.jpg"],
            "localhost:3000"
        );

        await savedPostService.savePost(user!, post.id);

        const result = await savedPostService.unSavePost(user!, post.id);

        expect(result.message).toEqual("Post unsaved");
    });
});
