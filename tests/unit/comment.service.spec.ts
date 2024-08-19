import { UserService } from "../../src/modules/user/user.service";
import { createTestDb } from "../../src/utility/test-db";
import { ServiceFactory } from "../../src/utility/service-factory";
import { PostService } from "../../src/modules/post/post.service";
import { CommentService } from "../../src/modules/post/comment/comment.service";

describe("User relation service test suite", () => {
    let serviceFactory: ServiceFactory;
    let userService: UserService;
    let postService: PostService;
    let CommentService: CommentService;

    beforeEach(async () => {
        const dataSource = await createTestDb();
        serviceFactory = new ServiceFactory(dataSource);

        userService = serviceFactory.getUserService();
        postService = serviceFactory.getPostService();
        CommentService = serviceFactory.getCommentService();

        await userService.createUser({
            username: "test",
            email: "test@gmail.com",
            password: "test",
        });
    });

    describe("comment on post", () => {});
});
