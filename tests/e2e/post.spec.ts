import { makeApp } from "../../src/api";
import { Express } from "express";
import request from "supertest";
import { createTestDb } from "../../src/utility/test-db";
import { PostDto } from "../../src/modules/post/dto/post.dto";
import { ServiceFactory } from "../../src/utility/service-factory";

describe("Post route test suite", () => {
    let app: Express;
    let serviceFactory: ServiceFactory;

    beforeAll(async () => {
        const dataSource = await createTestDb();
        serviceFactory = new ServiceFactory(dataSource);

        app = makeApp(
            dataSource,
            serviceFactory.getUserService(),
            serviceFactory.getUserRelationService(),
            serviceFactory.getPostService(),
            serviceFactory.getCommentService(),
            serviceFactory.getPostLikeService(),
            serviceFactory.getCommentLikeService(),
            serviceFactory.getSavedPostService()
        );

        await request(app).post("/api/user/signup").send({
            username: "test",
            email: "test@gmail.com",
            password: "test",
        });
    });

    describe("createPost", () => {
        it("should create post succesfully", async () => {
            const response = await request(app)
                .post("/api/user/signin")
                .send({ credential: "test", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            expect(cookies).toBeDefined();
            const cookie = cookies[0];

            const postDto: PostDto = {
                caption: "This is a test post #test",
                mentions: ["user1", "user2"],
            };

            const postImagesFileNames = ["img1.jpg", "img2.jpg"];

            const create_post_response = await request(app)
                .post("/api/post/createpost")
                .set("Cookie", [cookie])
                .field("caption", postDto.caption)
                .field("mentions", postDto.mentions)

                .attach("postImage", Buffer.from(""), "testFile1.jpg")
                .attach("postImage", Buffer.from(""), "testFile2.jpg")
                .expect(200);
            expect(create_post_response.body.caption).toBe(postDto.caption);
            expect(create_post_response.body.mentions).toEqual(
                postDto.mentions
            );
            expect(create_post_response.body.tags).toEqual(["#test"]);
            expect(create_post_response.body.images).toHaveLength(
                postImagesFileNames.length
            );
        });

        it("should fail if no image present in createpost request", async () => {
            const response = await request(app)
                .post("/api/user/signin")
                .send({ credential: "test", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            expect(cookies).toBeDefined();
            const cookie = cookies[0];
            const postDto: PostDto = {
                caption: "This is a test post #test",
                mentions: ["user1", "user2"],
            };

            const create_post_response = await request(app)
                .post("/api/post/createpost")
                .set("Cookie", [cookie])
                .field("caption", postDto.caption)
                .field("mentions", postDto.mentions)

                .expect(400);
        });

        it("should fail user not authenticate", async () => {
            const postDto: PostDto = {
                caption: "This is a test post #test",
                mentions: ["user1", "user2"],
            };

            const create_post_response = await request(app)
                .post("/api/post/createpost")
                .set("Cookie", [
                    "token=eyJhbGciOAiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3MjM2NzA1ODMsImV4cCI6MTcyMzY5OTM4M30.JP9wOa5ebG6mlReYeDU03wUc95CJRw1fxoqQiwmbg0c; Path=/; HttpOnly",
                ])
                .field("caption", postDto.caption)
                .field("mentions", postDto.mentions)
                .attach("postImage", Buffer.from(""), "testFile1.jpg")
                .attach("postImage", Buffer.from(""), "testFile2.jpg")
                .expect(401);
        });
    });

    describe("get Post by id", () => {
        it("should  return a post with id", async () => {
            const response = await request(app)
                .post("/api/user/signin")
                .send({ credential: "test", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            expect(cookies).toBeDefined();
            const cookie = cookies[0];

            const postDto: PostDto = {
                caption: "This is a test post #test",
                mentions: ["user1", "user2"],
            };

            const postImagesFileNames = ["img1.jpg", "img2.jpg"];

            const create_post_response = await request(app)
                .post("/api/post/createpost")
                .set("Cookie", [cookie])
                .field("caption", postDto.caption)
                .field("mentions", postDto.mentions)

                .attach("postImage", Buffer.from(""), "testFile1.jpg")
                .attach("postImage", Buffer.from(""), "testFile2.jpg")
                .expect(200);

            const response_getPostByPostId = await request(app)
                .get(`/api/post/${create_post_response.body.id}`)
                .set("Cookie", [cookie])
                .expect(200);
            expect(response_getPostByPostId.body.caption).toBe(postDto.caption);
            expect(response_getPostByPostId.body.mentions).toEqual(
                postDto.mentions
            );
            expect(response_getPostByPostId.body.tags).toEqual(["#test"]);
            expect(response_getPostByPostId.body.images).toHaveLength(
                postImagesFileNames.length
            );
        });

        it("should fail if post id is not valid", async () => {
            const response = await request(app)
                .post("/api/user/signin")
                .send({ credential: "test", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            expect(cookies).toBeDefined();
            const cookie = cookies[0];

            const response_getPostByPostId = await request(app)
                .get("/api/post/a3efc682-66b1-402a-9b58-c0a114c1a9c0")
                .set("Cookie", [cookie])
                .expect(404);
        });
    });

    describe("Update post", () => {
        it("should update post", async () => {
            const response = await request(app)
                .post("/api/user/signin")
                .send({ credential: "test", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            expect(cookies).toBeDefined();
            const cookie = cookies[0];

            const postDto: PostDto = {
                caption: "This is a test post #test",
                mentions: ["user1", "user2"],
            };

            const create_post_response = await request(app)
                .post("/api/post/createpost")
                .set("Cookie", [cookie])
                .field("caption", postDto.caption)
                .field("mentions", postDto.mentions)
                .attach("postImage", Buffer.from(""), "testFile1.jpg")
                .attach("postImage", Buffer.from(""), "testFile2.jpg")
                .expect(200);

            const updatedPostDto: PostDto = {
                caption: "This #is a test #post #test",
                mentions: ["user1", "user2", "user3"],
            };

            const response_editpost = await request(app)
                .post(`/api/post/updatepost/${create_post_response.body.id}`)
                .set("Cookie", [cookie])
                .field("caption", updatedPostDto.caption)
                .field("mentions", updatedPostDto.mentions)
                .attach("postImage", Buffer.from(""), "testFile2.jpg")
                .attach("postImage", Buffer.from(""), "testFile3.jpg")
                .attach("postImage", Buffer.from(""), "testFile4.jpg")
                .expect(200);
            expect(response_editpost.body.caption).toBe(updatedPostDto.caption);
            expect(response_editpost.body.mentions).toEqual(
                updatedPostDto.mentions
            );
            expect(response_editpost.body.tags).toEqual([
                "#is",
                "#post",
                "#test",
            ]);
            expect(response_editpost.body.images).toHaveLength(3);
        });
    });

    describe("Comment", () => {
        it("should comment on post", async () => {
            const response = await request(app)
                .post("/api/user/signin")
                .send({ credential: "test", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            expect(cookies).toBeDefined();
            const cookie = cookies[0];

            const postDto: PostDto = {
                caption: "This is a test post #test",
                mentions: ["user1", "user2"],
            };

            const create_post_response = await request(app)
                .post("/api/post/createpost")
                .set("Cookie", [cookie])
                .field("caption", postDto.caption)
                .field("mentions", postDto.mentions)
                .attach("postImage", Buffer.from(""), "testFile1.jpg")
                .attach("postImage", Buffer.from(""), "testFile2.jpg")
                .expect(200);

            const response_comment = await request(app)
                .post("/api/post/comment")
                .set("Cookie", [cookie])
                .send({
                    postId: create_post_response.body.id,
                    text: "test",
                })
                .expect(200);

            expect(response_comment.body.text).toBe("test");
        });

        it("should comment on comment", async () => {
            const response = await request(app)
                .post("/api/user/signin")
                .send({ credential: "test", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            expect(cookies).toBeDefined();
            const cookie = cookies[0];

            const postDto: PostDto = {
                caption: "This is a test post #test",
                mentions: ["user1", "user2"],
            };

            const create_post_response = await request(app)
                .post("/api/post/createpost")
                .set("Cookie", [cookie])
                .field("caption", postDto.caption)
                .field("mentions", postDto.mentions)
                .attach("postImage", Buffer.from(""), "testFile1.jpg")
                .attach("postImage", Buffer.from(""), "testFile2.jpg")
                .expect(200);

            const response_post_comment = await request(app)
                .post("/api/post/comment")
                .set("Cookie", [cookie])
                .send({
                    postId: create_post_response.body.id,
                    text: "test",
                })
                .expect(200);

            const response_comment_comment = await request(app)
                .post("/api/post/comment")
                .set("Cookie", [cookie])
                .send({
                    postId: create_post_response.body.id,
                    text: "comment to comment test",
                    commentId: response_post_comment.body.id,
                })
                .expect(200);

            expect(response_comment_comment.body.text).toBe(
                "comment to comment test"
            );
        });
    });

    describe("post like and unlike", () => {
        it("should pass like post and like status of post should be true", async () => {
            const response = await request(app)
                .post("/api/user/signin")
                .send({ credential: "test", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            expect(cookies).toBeDefined();
            const cookie = cookies[0];

            const postDto: PostDto = {
                caption: "This is a test post #test",
                mentions: ["user1", "user2"],
            };

            const create_post_response = await request(app)
                .post("/api/post/createpost")
                .set("Cookie", [cookie])
                .field("caption", postDto.caption)
                .field("mentions", postDto.mentions)
                .attach("postImage", Buffer.from(""), "testFile1.jpg")
                .attach("postImage", Buffer.from(""), "testFile2.jpg")
                .expect(200);

            const response_post_like = await request(app)
                .post(`/api/post/likepost/${create_post_response.body.id}`)
                .set("Cookie", [cookie])
                .expect(200);
            expect(response_post_like.body.message).toBe("Post liked");

            const post = await request(app)
                .get(`/api/post/${create_post_response.body.id}`)
                .set("Cookie", [cookie])
                .expect(200);
            expect(post.body.like_status).toBe(true);
        });

        it("should fail like post more than onc time", async () => {
            const response = await request(app)
                .post("/api/user/signin")
                .send({ credential: "test", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            expect(cookies).toBeDefined();
            const cookie = cookies[0];

            const postDto: PostDto = {
                caption: "This is a test post #test",
                mentions: ["user1", "user2"],
            };

            const create_post_response = await request(app)
                .post("/api/post/createpost")
                .set("Cookie", [cookie])
                .field("caption", postDto.caption)
                .field("mentions", postDto.mentions)
                .attach("postImage", Buffer.from(""), "testFile1.jpg")
                .attach("postImage", Buffer.from(""), "testFile2.jpg")
                .expect(200);

            const response_post_like = await request(app)
                .post(`/api/post/likepost/${create_post_response.body.id}`)
                .set("Cookie", [cookie])
                .expect(200);
            expect(response_post_like.body.message).toBe("Post liked");

            const post = await request(app)
                .get(`/api/post/${create_post_response.body.id}`)
                .set("Cookie", [cookie])
                .expect(200);
            expect(post.body.like_status).toBe(true);

            const response_post_like2 = await request(app)
                .post(`/api/post/likepost/${create_post_response.body.id}`)
                .set("Cookie", [cookie])
                .expect(400);
            expect(response_post_like2.body.message).toBe("Bad Request");
        });

        it("should fail if unlike post that not liked", async () => {
            const response = await request(app)
                .post("/api/user/signin")
                .send({ credential: "test", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            expect(cookies).toBeDefined();
            const cookie = cookies[0];

            const postDto: PostDto = {
                caption: "This is a test post #test",
                mentions: ["user1", "user2"],
            };

            const create_post_response = await request(app)
                .post("/api/post/createpost")
                .set("Cookie", [cookie])
                .field("caption", postDto.caption)
                .field("mentions", postDto.mentions)
                .attach("postImage", Buffer.from(""), "testFile1.jpg")
                .attach("postImage", Buffer.from(""), "testFile2.jpg")
                .expect(200);

            const response_post_unlike = await request(app)
                .post(`/api/post/unlikepost/${create_post_response.body.id}`)
                .set("Cookie", [cookie])
                .expect(400);
            expect(response_post_unlike.body.message).toBe("Bad Request");
        });

        it("should pass like post and then unlike", async () => {
            const response = await request(app)
                .post("/api/user/signin")
                .send({ credential: "test", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            expect(cookies).toBeDefined();
            const cookie = cookies[0];

            const postDto: PostDto = {
                caption: "This is a test post #test",
                mentions: ["user1", "user2"],
            };

            const create_post_response = await request(app)
                .post("/api/post/createpost")
                .set("Cookie", [cookie])
                .field("caption", postDto.caption)
                .field("mentions", postDto.mentions)
                .attach("postImage", Buffer.from(""), "testFile1.jpg")
                .attach("postImage", Buffer.from(""), "testFile2.jpg")
                .expect(200);

            const response_post_like = await request(app)
                .post(`/api/post/likepost/${create_post_response.body.id}`)
                .set("Cookie", [cookie])
                .expect(200);
            expect(response_post_like.body.message).toBe("Post liked");

            const post = await request(app)
                .get(`/api/post/${create_post_response.body.id}`)
                .set("Cookie", [cookie])
                .expect(200);
            expect(post.body.like_status).toBe(true);

            const response_post_unlike = await request(app)
                .post(`/api/post/unlikepost/${create_post_response.body.id}`)
                .set("Cookie", [cookie])
                .expect(200);
            expect(response_post_unlike.body.message).toBe("Post unliked");

            const post2 = await request(app)
                .get(`/api/post/${create_post_response.body.id}`)
                .set("Cookie", [cookie])
                .expect(200);
            expect(post2.body.like_status).toBe(false);
        });
    });
});