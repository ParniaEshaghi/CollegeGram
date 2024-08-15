import { makeApp } from "../../src/api";
import { Express } from "express";
import request from "supertest";
import { UserRepository } from "../../src/modules/user/user.repository";
import { UserService } from "../../src/modules/user/user.service";
import { createTestDb } from "../../src/utility/test-db";

import { UserRelationRepository } from "../../src/modules/user/userRelation/userRelation.repository";
import { UserRelationService } from "../../src/modules/user/userRelation/userRelation.service";
import { PasswordResetTokenRepository } from "../../src/modules/user/forgetPassword/forgetPassword.repository";
import { EmailService } from "../../src/modules/email/email.service";
import { ForgetPasswordService } from "../../src/modules/user/forgetPassword/forgetPassword.service";
import { PostRepository } from "../../src/modules/post/post.repository";
import { PostService } from "../../src/modules/post/post.service";
import { PostDto } from "../../src/modules/post/entity/dto/post.dto";

describe("Post route test suite", () => {
    let app: Express;
    let userRepo: UserRepository;
    let passwordResetTokenRepo: PasswordResetTokenRepository;
    let forgetPasswordService: ForgetPasswordService;
    let userRelationRepo: UserRelationRepository;
    let userService: UserService;
    let emailService: EmailService;
    let userRelationService: UserRelationService;
    let postRepo: PostRepository;
    let postService: PostService;

    beforeAll(async () => {
        const dataSource = await createTestDb();
        userRepo = new UserRepository(dataSource);
        passwordResetTokenRepo = new PasswordResetTokenRepository(dataSource);
        forgetPasswordService = new ForgetPasswordService(
            passwordResetTokenRepo
        );
        userRelationRepo = new UserRelationRepository(dataSource);
        emailService = new EmailService();
        userService = new UserService(
            userRepo,
            forgetPasswordService,
            emailService
        );
        userRelationService = new UserRelationService(
            userRelationRepo,
            userService
        );
        postRepo = new PostRepository(dataSource);
        postService = new PostService(postRepo);
        app = makeApp(
            dataSource,
            userService,
            userRelationService,
            postService
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
            // console.log(create_post_response.body.images);
            expect(create_post_response.body.caption).toBe(postDto.caption);
            expect(create_post_response.body.mentions).toEqual(
                postDto.mentions
            );
            expect(create_post_response.body.tags).toEqual(["#test"]);
            expect(create_post_response.body.images).toHaveLength(
                postImagesFileNames.length
            );
            console.log(create_post_response.body);
        });

        it("should fail if no image present in createpost request", async () => {
            const response = await request(app)
                .post("/api/user/signin")
                .send({ credential: "test", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            expect(cookies).toBeDefined();
            const cookie = cookies[0];
            console.log(cookie);
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
});
