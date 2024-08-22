import { makeApp } from "../../src/api";
import { Express } from "express";
import request from "supertest";
import { createTestDb } from "../../src/utility/test-db";
import nodemailer from "nodemailer";
import { randomUUID } from "crypto";
import { PostDto } from "../../src/modules/post/dto/post.dto";
import { ServiceFactory } from "../../src/utility/service-factory";

jest.mock("nodemailer");

describe("User route test suite", () => {
    let app: Express;
    let serviceFactory: ServiceFactory;

    let sendMailMock: jest.Mock;
    let emailContent: string | undefined;

    beforeEach(async () => {
        jest.clearAllMocks();

        sendMailMock = jest.fn().mockImplementation((mailOptions) => {
            emailContent = mailOptions.html;
            return Promise.resolve({});
        });

        (nodemailer.createTransport as jest.Mock).mockReturnValue({
            sendMail: sendMailMock,
        });

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

    describe("Signing up", () => {
        it("should create a user in database upon signup", async () => {
            await request(app)
                .post("/api/user/signup")
                .send({
                    username: "signup_test",
                    email: "signup_test@gmail.com",
                    password: "signup_test",
                })
                .expect(200);
        });

        it("should fail if username or password are already in use", async () => {
            await request(app)
                .post("/api/user/signup")
                .send({
                    username: "test",
                    email: "test@gmail.com",
                    password: "test",
                })
                .expect(403);
        });

        it("should fail if a field is not provided", async () => {
            await request(app)
                .post("/api/user/signup")
                .send({
                    username: "",
                    email: "test@gmail.com",
                    password: "test",
                })
                .expect(400);
        });
    });

    describe("Signing in", () => {
        it("should sign in with valid username", async () => {
            const response = await request(app)
                .post("/api/user/signin")
                .send({ credential: "test", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            expect(cookies).toBeDefined();
        });

        it("should sign in with valid email", async () => {
            const response = await request(app)
                .post("/api/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            expect(cookies).toBeDefined();
        });

        it("should fail to login if username is not valid", async () => {
            await request(app)
                .post("/api/user/signin")
                .send({ credential: "testwrong", password: "test" })
                .expect(401);
        });

        it("should fail to login if email is not valid", async () => {
            await request(app)
                .post("/api/user/signin")
                .send({ credential: "testwrong@gmail.com", password: "test" })
                .expect(401);
        });

        it("should fail to login if password is not valid", async () => {
            await request(app)
                .post("/api/user/signin")
                .send({ credential: "test", password: "testwrong" })
                .expect(401);
        });

        it("should fail if username or password in empty", async () => {
            await request(app)
                .post("/api/user/signin")
                .send({ credential: "", password: "test" })
                .expect(400);
        });
    });

    describe("Forget password", () => {
        it.skip("should send forget email", async () => {
            await request(app)
                .post("/api/user/forgetpassword")
                .send({ credential: "test@gmail.com" })
                .expect(200);

            expect(sendMailMock).toHaveBeenCalledTimes(1);

            expect(sendMailMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: "test@gmail.com",
                })
            );

            expect(emailContent).toBeDefined();
            expect(emailContent).toContain(
                "http://37.32.6.230/reset-password/"
            );
        });

        it("should fail if credential is empty", async () => {
            await request(app)
                .post("/api/user/forgetpassword")
                .send({ credential: "" })
                .expect(400);
        });

        it("should fail if credential is not valid", async () => {
            await request(app)
                .post("/api/user/forgetpassword")
                .send({ credential: "notvalid" })
                .expect(401);
        });
    });

    describe("Reset password", () => {
        it.skip("should reset password", async () => {
            await request(app)
                .post("/api/user/forgetpassword")
                .send({ credential: "test" });
            const emailContent = sendMailMock.mock.calls[0][0].html;
            const linkMatch = emailContent.match(
                /href="([^"]*reset-password\/[a-fA-F0-9-]+~[a-fA-F0-9-]+)"/
            );
            const resetLink = linkMatch ? linkMatch[1] : null;
            const tokenMatch = resetLink?.match(
                /reset-password\/([a-fA-F0-9-]+~[a-fA-F0-9-]+)$/
            );
            const token = tokenMatch ? tokenMatch[1] : null;

            await request(app)
                .post("/api/user/resetpassword")
                .send({ newPass: "newPass", token: token })
                .expect(200);
        });

        it("should fail if token is wrong or expired", async () => {
            await request(app)
                .post("/api/user/resetpassword")
                .send({
                    newPass: "newPass",
                    token: `${randomUUID()}~${randomUUID()}`,
                })
                .expect(401);
        });
    });

    describe("get edit profile", () => {
        it("should login and get edit profile page", async () => {
            let cookie;
            const response = await request(app)
                .post("/api/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            cookie = cookies[0];
            expect(cookies).toBeDefined();

            const response_getEdit_profile = await request(app)
                .get("/api/user/geteditprofile")
                .set("Cookie", [cookie]);
            expect(response_getEdit_profile.status).toBe(200);

            expect(response_getEdit_profile.body).toHaveProperty("firstname");
        });

        it("should fail if token is not specified", async () => {
            let cookie;
            const response = await request(app)
                .post("/api/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            cookie = cookies[0];
            expect(cookies).toBeDefined();

            const response_getEdit_profile = await request(app).get(
                "/api/user/geteditprofile"
            );
            expect(response_getEdit_profile.status).toBe(401);
        });

        it("should fail if token is not valid", async () => {
            const response = await request(app)
                .post("/api/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            expect(cookies).toBeDefined();

            const response_getEdit_profile = await request(app)
                .get("/api/user/geteditprofile")
                .set("Cookie", [
                    "token=yyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.              eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3MjI5NzQ3MTEsImV4cCI6MTcyMzAwMzUxMX0.1oB7dtlTun4wRnvh9U-RqBc3q_7QvECZt7QM1zFRYZQ; Path=/; HttpOnly",
                ]);

            expect(response_getEdit_profile.status).toBe(401);
        });
    });

    describe("get profile info", () => {
        it("should login and get profile info page", async () => {
            let cookie;
            const response = await request(app)
                .post("/api/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            cookie = cookies[0];
            expect(cookies).toBeDefined();

            const response_profile_info = await request(app)
                .get("/api/user/profileInfo")
                .set("Cookie", [cookie]);
            expect(response_profile_info.status).toBe(200);

            expect(response_profile_info.body).toHaveProperty("follower_count");
        });

        it("should fail if token is not specified", async () => {
            let cookie;
            const response = await request(app)
                .post("/api/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            cookie = cookies[0];
            expect(cookies).toBeDefined();

            const response_profile_info = await request(app).get(
                "/api/user/profileInfo"
            );
            expect(response_profile_info.status).toBe(401);
        });

        it("should fail if token is not valid", async () => {
            const response = await request(app)
                .post("/api/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            expect(cookies).toBeDefined();

            const response_profile_info = await request(app)
                .get("/api/user/profileInfo")
                .set("Cookie", [
                    "token=yyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.              eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3MjI5NzQ3MTEsImV4cCI6MTcyMzAwMzUxMX0.1oB7dtlTun4wRnvh9U-RqBc3q_7QvECZt7QM1zFRYZQ; Path=/; HttpOnly",
                ]);

            expect(response_profile_info.status).toBe(401);
        });

        it("should get profile with posts", async () => {
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

            await request(app)
                .post("/api/post/createpost")
                .set("Cookie", [cookie])
                .field("caption", postDto.caption)
                .field("mentions", postDto.mentions)
                .attach("postImage", Buffer.from(""), "testFile1.jpg")
                .attach("postImage", Buffer.from(""), "testFile2.jpg")
                .expect(200);

            const response_profile_info = await request(app)
                .get("/api/user/profileInfo")
                .set("Cookie", [cookie]);
            expect(response_profile_info.status).toBe(200);
            expect(response_profile_info.body).toHaveProperty("posts");
            expect(response_profile_info.body.posts).toHaveLength(1);
            expect(response_profile_info.body.posts[0].images).toHaveLength(2);
        });
    });

    describe("Editing Profile", () => {
        it("should update profile", async () => {
            const response = await request(app)
                .post("/api/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            const cookie = cookies[0];
            expect(cookies).toBeDefined();

            const response_editprofile = await request(app)
                .post("/api/user/editprofile")
                .set("Cookie", [cookie])
                .send({
                    password: "newpass",
                    email: "changedemail@gmail.com",
                    firstname: "test",
                    lastname: "test",
                    profileStatus: "private",
                    bio: "test",
                })
                .expect(200);

            expect(response_editprofile.body.email).toBe(
                "changedemail@gmail.com"
            );
            expect(response_editprofile.body.firstname).toBe("test");
            expect(response_editprofile.body.profileStatus).toBe("private");
        });

        it("should fail to update profile if cookie token is not valid", async () => {
            const response = await request(app)
                .post("/api/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            expect(cookies).toBeDefined();

            await request(app)
                .post("/api/user/editprofile")
                .set("Cookie", [
                    "token=yyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.              eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3MjI5NzQ3MTEsImV4cCI6MTcyMzAwMzUxMX0.1oB7dtlTun4wRnvh9U-RqBc3q_7QvECZt7QM1zFRYZQ; Path=/; HttpOnly",
                ])
                .send({
                    password: "newpass",
                    email: "changedemail@gmail.com",
                    firstname: "test",
                    lastname: "test",
                    profileStatus: "private",
                    bio: "test",
                })
                .expect(401);
        });

        it("should update profile and handle image upload", async () => {
            const response = await request(app)
                .post("/api/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            const cookie = cookies[0];
            expect(cookies).toBeDefined();

            const response_editprofile = await request(app)
                .post("/api/user/editprofile")
                .set("Cookie", [cookie])
                .field("email", "changedemail@gmail.com")
                .field("firstname", "test")
                .field("lastname", "test")
                .field("profileStatus", "private")
                .field("bio", "test")
                .field("password", "newpass")
                .attach("profileImage", Buffer.from(""), "testFile.jpg");

            expect(response_editprofile.status).toBe(200);
            expect(response_editprofile.body.email).toBe(
                "changedemail@gmail.com"
            );
            expect(response_editprofile.body.firstname).toBe("test");
            expect(response_editprofile.body.profileStatus).toBe("private");
        });

        it("should fail to upload file if it is text", async () => {
            const response = await request(app)
                .post("/api/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            const cookie = cookies[0];
            expect(cookies).toBeDefined();

            await request(app)
                .post("/api/user/editprofile")
                .set("Cookie", [cookie])
                .field("email", "changedemail@gmail.com")
                .field("firstName", "test")
                .field("lastName", "test")
                .field("profileStatus", "private")
                .field("bio", "test")
                .field("password", "newpass")
                .attach("profileImage", Buffer.from(""), "testFile.txt")
                .expect(400);
        });
    });

    describe("Following and unfollowing", () => {
        it("should follow user", async () => {
            await request(app).post("/api/user/signup").send({
                username: "follow_test",
                email: "follow_test@gmail.com",
                password: "follow_test",
            });

            const response = await request(app)
                .post("/api/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            const cookie = cookies[0];

            const follow_response = await request(app)
                .post("/api/user/follow/follow_test")
                .set("Cookie", [cookie])
                .expect(200);

            expect(follow_response.body.message).toBe("User followed");
        });

        it("should unfollow user", async () => {
            await request(app).post("/api/user/signup").send({
                username: "follow_test",
                email: "follow_test@gmail.com",
                password: "follow_test",
            });

            const response = await request(app)
                .post("/api/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            const cookie = cookies[0];

            await request(app)
                .post("/api/user/follow/follow_test")
                .set("Cookie", [cookie]);

            const unfollow_response = await request(app)
                .post("/api/user/unfollow/follow_test")
                .set("Cookie", [cookie])
                .expect(200);

            expect(unfollow_response.body.message).toBe("User unfollowed");
        });
    });

    describe("Get another user profile", () => {
        it("should get user profile / not followed", async () => {
            await request(app).post("/api/user/signup").send({
                username: "follow_test",
                email: "follow_test@gmail.com",
                password: "follow_test",
            });

            const response = await request(app)
                .post("/api/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            const cookie = cookies[0];

            const profile_response = await request(app)
                .get("/api/user/follow_test")
                .set("Cookie", [cookie])
                .expect(200);

            expect(profile_response.body.username).toBe("follow_test");
            expect(profile_response.body.follow_status).toBe(false);
        });

        it("should get user profile / followed", async () => {
            await request(app).post("/api/user/signup").send({
                username: "follow_test",
                email: "follow_test@gmail.com",
                password: "follow_test",
            });

            const response = await request(app)
                .post("/api/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            const cookie = cookies[0];

            await request(app)
                .post("/api/user/follow/follow_test")
                .set("Cookie", [cookie]);

            const profile_response = await request(app)
                .get("/api/user/follow_test")
                .set("Cookie", [cookie])
                .expect(200);

            expect(profile_response.body.username).toBe("follow_test");
            expect(profile_response.body.follow_status).toBe(true);
        });

        it("should fail to get profile if username is wrong", async () => {
            const response = await request(app)
                .post("/api/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            const cookie = cookies[0];
            await request(app)
                .get("/api/user/follow_test")
                .set("Cookie", [cookie])
                .expect(404);
        });
    });

    describe("follower, following list", () => {
        it("should get user followers list", async () => {
            await request(app).post("/api/user/signup").send({
                username: "user_test1",
                email: "user_test1@gmail.com",
                password: "user_test1",
            });

            await request(app).post("/api/user/signup").send({
                username: "user_test2",
                email: "user_test2@gmail.com",
                password: "user_test2",
            });

            await request(app).post("/api/user/signup").send({
                username: "user_test3",
                email: "user_test3@gmail.com",
                password: "user_test3",
            });

            const response = await request(app)
                .post("/api/user/signin")
                .send({
                    credential: "user_test1@gmail.com",
                    password: "user_test1",
                })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            const cookie = cookies[0];

            await request(app)
                .post("/api/user/follow/user_test2")
                .set("Cookie", [cookie]);

            const response2 = await request(app)
                .post("/api/user/signin")
                .send({
                    credential: "user_test3@gmail.com",
                    password: "user_test3",
                })
                .expect(200);
            const cookies2 = response2.headers["set-cookie"];
            const cookie2 = cookies2[0];

            await request(app)
                .post("/api/user/follow/user_test2")
                .set("Cookie", [cookie2]);

            const follower_list_response1 = await request(app)
                .get("/api/user/followers/user_test2?page=1&limit=10")
                .set("Cookie", [cookie2])
                .expect(200);
            expect(follower_list_response1.body.data.length).toBe(2);
            expect(follower_list_response1.body.meta.total).toBe(2);
            expect(follower_list_response1.body.meta.page).toBe(1);
            expect(follower_list_response1.body.meta.limit).toBe(10);

            const follower_list_response2 = await request(app)
                .get("/api/user/followers/user_test2?page=1&limit=1")
                .set("Cookie", [cookie2])
                .expect(200);
            expect(follower_list_response2.body.data.length).toBe(1);
            expect(follower_list_response2.body.meta.total).toBe(2);
            expect(follower_list_response2.body.meta.page).toBe(1);
            expect(follower_list_response2.body.meta.limit).toBe(1);

            const follower_list_response3 = await request(app)
                .get("/api/user/followers/user_test2?page=2&limit=1")
                .set("Cookie", [cookie2])
                .expect(200);
            expect(follower_list_response3.body.data.length).toBe(1);
            expect(follower_list_response3.body.meta.total).toBe(2);
            expect(follower_list_response3.body.meta.page).toBe(2);
            expect(follower_list_response3.body.meta.limit).toBe(1);
        });

        it("should get user following list", async () => {
            await request(app).post("/api/user/signup").send({
                username: "user_test1",
                email: "user_test1@gmail.com",
                password: "user_test1",
            });

            await request(app).post("/api/user/signup").send({
                username: "user_test2",
                email: "user_test2@gmail.com",
                password: "user_test2",
            });

            await request(app).post("/api/user/signup").send({
                username: "user_test3",
                email: "user_test3@gmail.com",
                password: "user_test3",
            });

            const response = await request(app)
                .post("/api/user/signin")
                .send({
                    credential: "user_test1@gmail.com",
                    password: "user_test1",
                })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            const cookie = cookies[0];

            await request(app)
                .post("/api/user/follow/user_test2")
                .set("Cookie", [cookie]);

            await request(app)
                .post("/api/user/follow/user_test3")
                .set("Cookie", [cookie]);

            const following_list_response1 = await request(app)
                .get("/api/user/followings/user_test1?page=1&limit=10")
                .set("Cookie", [cookie])
                .expect(200);
            expect(following_list_response1.body.data.length).toBe(2);
            expect(following_list_response1.body.meta.total).toBe(2);
            expect(following_list_response1.body.meta.page).toBe(1);
            expect(following_list_response1.body.meta.limit).toBe(10);

            const following_list_response2 = await request(app)
                .get("/api/user/followings/user_test1?page=1&limit=1")
                .set("Cookie", [cookie])
                .expect(200);
            expect(following_list_response2.body.data.length).toBe(1);
            expect(following_list_response2.body.meta.total).toBe(2);
            expect(following_list_response2.body.meta.page).toBe(1);
            expect(following_list_response2.body.meta.limit).toBe(1);

            const following_list_response3 = await request(app)
                .get("/api/user/followings/user_test1?page=2&limit=1")
                .set("Cookie", [cookie])
                .expect(200);
            expect(following_list_response3.body.data.length).toBe(1);
            expect(following_list_response3.body.meta.total).toBe(2);
            expect(following_list_response3.body.meta.page).toBe(2);
            expect(following_list_response3.body.meta.limit).toBe(1);
        });

        it("should get empty if no follower or no following exist", async () => {
            await request(app).post("/api/user/signup").send({
                username: "user_test1",
                email: "user_test1@gmail.com",
                password: "user_test1",
            });

            const response = await request(app)
                .post("/api/user/signin")
                .send({
                    credential: "user_test1@gmail.com",
                    password: "user_test1",
                })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            const cookie = cookies[0];

            const follower_list_response1 = await request(app)
                .get("/api/user/followers/user_test1?page=1&limit=10")
                .set("Cookie", [cookie])
                .expect(200);
            expect(follower_list_response1.body.data.length).toBe(0);
            expect(follower_list_response1.body.meta.total).toBe(0);
            expect(follower_list_response1.body.meta.page).toBe(1);
            expect(follower_list_response1.body.meta.limit).toBe(10);

            const following_list_response1 = await request(app)
                .get("/api/user/followings/user_test1?page=1&limit=10")
                .set("Cookie", [cookie])
                .expect(200);
            expect(following_list_response1.body.data.length).toBe(0);
            expect(following_list_response1.body.meta.total).toBe(0);
            expect(following_list_response1.body.meta.page).toBe(1);
            expect(following_list_response1.body.meta.limit).toBe(10);
        });

        it("should fail if user not exist", async () => {
            await request(app).post("/api/user/signup").send({
                username: "user_test1",
                email: "user_test1@gmail.com",
                password: "user_test1",
            });

            const response = await request(app)
                .post("/api/user/signin")
                .send({
                    credential: "user_test1@gmail.com",
                    password: "user_test1",
                })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            const cookie = cookies[0];

            const follower_list_response1 = await request(app)
                .get("/api/user/followers/user_test10?page=1&limit=10")
                .set("Cookie", [cookie])
                .expect(404);

            const following_list_response1 = await request(app)
                .get("/api/user/followings/user_test10?page=1&limit=10")
                .set("Cookie", [cookie])
                .expect(404);
        });

        it("should pass if page and limit not specified(user default values)", async () => {
            await request(app).post("/api/user/signup").send({
                username: "user_test1",
                email: "user_test1@gmail.com",
                password: "user_test1",
            });

            await request(app).post("/api/user/signup").send({
                username: "user_test2",
                email: "user_test2@gmail.com",
                password: "user_test2",
            });

            await request(app).post("/api/user/signup").send({
                username: "user_test3",
                email: "user_test3@gmail.com",
                password: "user_test3",
            });

            const response = await request(app)
                .post("/api/user/signin")
                .send({
                    credential: "user_test1@gmail.com",
                    password: "user_test1",
                })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            const cookie = cookies[0];

            await request(app)
                .post("/api/user/follow/user_test2")
                .set("Cookie", [cookie]);

            await request(app)
                .post("/api/user/follow/user_test3")
                .set("Cookie", [cookie]);

            const following_list_response1 = await request(app)
                .get("/api/user/followings/user_test1")
                .set("Cookie", [cookie])
                .expect(200);
            expect(following_list_response1.body.data.length).toBe(2);
            expect(following_list_response1.body.meta.total).toBe(2);
            expect(following_list_response1.body.meta.page).toBe(1);
            expect(following_list_response1.body.meta.limit).toBe(10);
        });
    });

    describe("Save post, Unsave post", () => {
        it("should pass save post", async () => {
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

            const response_post_save = await request(app)
                .post(`/api/user/savepost/${create_post_response.body.id}`)
                .set("Cookie", [cookie])
                .expect(200);
            expect(response_post_save.body.message).toBe("Post saved");

            const post = await request(app)
                .get(`/api/post/${create_post_response.body.id}`)
                .set("Cookie", [cookie])
                .expect(200);
            expect(post.body.save_status).toBe(true);
        });

        it("should fail save post more than one time", async () => {
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

            const response_post_save = await request(app)
                .post(`/api/user/savepost/${create_post_response.body.id}`)
                .set("Cookie", [cookie])
                .expect(200);
            expect(response_post_save.body.message).toBe("Post saved");

            const post = await request(app)
                .get(`/api/post/${create_post_response.body.id}`)
                .set("Cookie", [cookie])
                .expect(200);
            expect(post.body.save_status).toBe(true);

            const response_post_save2 = await request(app)
                .post(`/api/user/savepost/${create_post_response.body.id}`)
                .set("Cookie", [cookie])
                .expect(400);
            expect(response_post_save2.body.message).toBe("Bad Request");
        });

        it("should fail if unsave post that not saved", async () => {
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

            const response_post_unsave = await request(app)
                .post(`/api/user/unsavepost/${create_post_response.body.id}`)
                .set("Cookie", [cookie])
                .expect(400);
            expect(response_post_unsave.body.message).toBe("Bad Request");
        });

        it("should pass save post and then unsave", async () => {
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

            const response_post_save = await request(app)
                .post(`/api/user/savepost/${create_post_response.body.id}`)
                .set("Cookie", [cookie])
                .expect(200);
            expect(response_post_save.body.message).toBe("Post saved");

            const post = await request(app)
                .get(`/api/post/${create_post_response.body.id}`)
                .set("Cookie", [cookie])
                .expect(200);
            expect(post.body.save_status).toBe(true);

            const response_post_unsave = await request(app)
                .post(`/api/user/unsavepost/${create_post_response.body.id}`)
                .set("Cookie", [cookie])
                .expect(200);
            expect(response_post_unsave.body.message).toBe("Post unsaved");

            const post2 = await request(app)
                .get(`/api/post/${create_post_response.body.id}`)
                .set("Cookie", [cookie])
                .expect(200);
            expect(post2.body.save_status).toBe(false);
        });
    });
});
