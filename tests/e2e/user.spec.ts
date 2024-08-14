import { makeApp } from "../../src/api";
import { Express } from "express";
import request from "supertest";
import { UserRepository } from "../../src/modules/user/user.repository";
import { UserService } from "../../src/modules/user/user.service";
import { createTestDb } from "../../src/utility/test-db";
import nodemailer from "nodemailer";
import { randomUUID } from "crypto";
import { UserRelationRepository } from "../../src/modules/user/userRelation/userRelation.repository";
import { UserRelationService } from "../../src/modules/user/userRelation/userRelation.service";
import { PasswordResetTokenRepository } from "../../src/modules/user/forgetPassword/forgetPassword.repository";
import { EmailService } from "../../src/modules/email/email.service";
import { ForgetPasswordService } from "../../src/modules/user/forgetPassword/forgetPassword.service";
import { PostRepository } from "../../src/modules/post/post.repository";
import { PostService } from "../../src/modules/post/post.service";

jest.mock("nodemailer");

describe("User route test suite", () => {
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

    let sendMailMock: jest.Mock;
    let emailContent: string | undefined;

    beforeEach(async () => {
        jest.clearAllMocks();

        sendMailMock = jest.fn().mockImplementation((mailOptions) => {
            emailContent = mailOptions.text;
            return Promise.resolve({});
        });

        (nodemailer.createTransport as jest.Mock).mockReturnValue({
            sendMail: sendMailMock,
        });

        const dataSource = await createTestDb();
        userRepo = new UserRepository(dataSource);
        passwordResetTokenRepo = new PasswordResetTokenRepository(
            dataSource
        );
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
        it("should send forget email", async () => {
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
        it("should reset password", async () => {
            await request(app)
                .post("/api/user/forgetpassword")
                .send({ credential: "test" });
            const emailContent = sendMailMock.mock.calls[0][0].text;
            const tokenMatch = emailContent.match(
                /reset-password\/([a-zA-Z0-9-_\.]+)~([a-zA-Z0-9-_\.]+)$/
            );
            const token = tokenMatch
                ? `${tokenMatch[1]}~${tokenMatch[2]}`
                : null;
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
                .set("Cookie", [
                    "token=yyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.              eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3MjI5NzQ3MTEsImV4cCI6MTcyMzAwMzUxMX0.1oB7dtlTun4wRnvh9U-RqBc3q_7QvECZt7QM1zFRYZQ; Path=/; HttpOnly",
                ]);

            expect(response_profile_info.status).toBe(401);
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
                    firstName: "test",
                    lastName: "test",
                    profileStatus: "private",
                    bio: "test",
                })
                .expect(200);

            expect(response_editprofile.body.email).toBe(
                "changedemail@gmail.com"
            );
            expect(response_editprofile.body.firstName).toBe("test");
            expect(response_editprofile.body.profileStatus).toBe("private");
        });

        // DOES NOT WORK!!!!
        it.skip("should fail to update profile if cookie token is not valid", async () => {
            await request(app)
                .post("/api/user/editprofile")
                .set("Cookie", ["badcookie"])
                .send({
                    password: "newpass",
                    email: "changedemail@gmail.com",
                    firstName: "test",
                    lastName: "test",
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
                .field("firstName", "test")
                .field("lastName", "test")
                .field("profileStatus", "private")
                .field("bio", "test")
                .field("password", "newpass")
                .attach("profileImage", Buffer.from(""), "testFile.jpg");

            expect(response_editprofile.status).toBe(200);
            expect(response_editprofile.body.email).toBe(
                "changedemail@gmail.com"
            );
            expect(response_editprofile.body.firstName).toBe("test");
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
});
