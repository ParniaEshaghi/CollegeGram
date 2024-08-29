import { PostService } from "../../src/modules/postHandler/post/post.service";
import { UserService } from "../../src/modules/userHandler/user/user.service";
import { createTestDb } from "../../src/utility/test-db";
import { ServiceFactory } from "../../src/utility/service-factory";
import { NotFoundError, ForbiddenError } from "../../src/utility/http-errors";
import { randomUUID } from "crypto";
import { UpdatePostDto } from "../../src/modules/postHandler/post/dto/updatePost.dto";

describe("PostService test suite", () => {
    let serviceFactory: ServiceFactory;
    let postService: PostService;
    let userService: UserService;

    beforeEach(async () => {
        const dataSource = await createTestDb();
        serviceFactory = new ServiceFactory(dataSource);

        postService = serviceFactory.getPostService();
        userService = serviceFactory.getUserService();

        await userService.createUser({
            username: "test",
            email: "test@gmail.com",
            password: "test",
        });

        await userService.createUser({
            username: "anotherUser",
            email: "anotherUser@gmail.com",
            password: "anotherUserPassword",
        });
    });

    it("should create a post successfully if user is valid", async () => {
        const user = await userService.getUserByUsername("test");

        const postDto = {
            caption: "Test caption",
            mentions: ["test_mention"],
        };

        const result = await postService.createPost(
            user!,
            postDto,
            ["testfile.jpg"],
            "localhost:3000"
        );

        expect(result.caption).toEqual("Test caption");
        expect(result.images).toContain(
            "localhost:3000/api/images/posts/testfile.jpg"
        );
    });

    it("should throw NotFoundError if post is not found when getting a post by ID", async () => {
        const user = await userService.getUserByUsername("test");

        await expect(
            postService.getPostByPostId(user!, randomUUID(), "localhost:3000")
        ).rejects.toThrow(NotFoundError);
    });

    it("should update a post successfully if user is valid and owns the post", async () => {
        const user = await userService.getUserByUsername("test");
        const postDto = {
            caption: "Test caption",
            mentions: ["test_mention"],
        };

        const post = await postService.createPost(
            user!,
            postDto,
            ["testfile.jpg"],
            "localhost:3000"
        );

        const updatedPostDto = {
            caption: "Updated caption",
            mentions: ["updated_mention"],
            deletedImages: [],
        };

        const updatedPost = await postService.updatePost(
            user!,
            post.id,
            updatedPostDto,
            ["updatedfile.jpg"],
            "localhost:3000"
        );

        expect(updatedPost.caption).toEqual("Updated caption");
        expect(updatedPost.images).toContain(
            "localhost:3000/api/images/posts/updatedfile.jpg"
        );
    });

    it("should throw ForbiddenError if user tries to update a post they don't own", async () => {
        const user = await userService.getUserByUsername("test");
        const postDto = {
            caption: "Test caption",
            mentions: ["test_mention"],
        };

        const post = await postService.createPost(
            user!,
            postDto,
            ["testfile.jpg"],
            "localhost:3000"
        );

        const anotherUser = await userService.getUserByUsername("anotherUser");

        const updatedPostDto: UpdatePostDto = {
            caption: "Updated caption",
            mentions: ["updated_mention"],
            deletedImages: [],
        };

        await expect(
            postService.updatePost(
                anotherUser!,
                post.id,
                updatedPostDto,
                ["updatedfile.jpg"],
                "localhost:3000"
            )
        ).rejects.toThrow(ForbiddenError);
    });

    it("should throw NotFoundError if post is not found when updating", async () => {
        const user = await userService.getUserByUsername("test");

        const updatedPostDto = {
            caption: "Updated caption",
            mentions: ["updated_mention"],
            deletedImages: [],
        };

        await expect(
            postService.updatePost(
                user!,
                randomUUID(),
                updatedPostDto,
                ["updatedfile.jpg"],
                "localhost:3000"
            )
        ).rejects.toThrow(NotFoundError);
    });
});
