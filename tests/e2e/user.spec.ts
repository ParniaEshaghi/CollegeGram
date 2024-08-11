import { makeApp } from "../../src/api";
import { Express } from "express";
import request from "supertest";
import bcrypt from "bcrypt";
import { UserRepository } from "../../src/modules/user/user.repository";
import { PasswordResetTokenRepository } from "../../src/modules/user/forgetPassword.repository";
import { UserService } from "../../src/modules/user/user.service";
import { createTestDb } from "../../src/utility/test-db";
import nodemailer from "nodemailer";

jest.mock("nodemailer");

describe("User route test suite", () => {
    let app: Express;
    let userRepo: UserRepository;
    let passwordResetTokenRepo: PasswordResetTokenRepository;
    let userService: UserService;

    let sendMailMock: jest.Mock;
    let emailContent: string | undefined;

    beforeEach(async () => {
        const dataSource = await createTestDb();
        userRepo = new UserRepository(dataSource);
        passwordResetTokenRepo = new PasswordResetTokenRepository(dataSource);
        userService = new UserService(userRepo, passwordResetTokenRepo);
        app = makeApp(dataSource, userService);

        jest.clearAllMocks();

        sendMailMock = jest.fn().mockImplementation((mailOptions) => {
            emailContent = mailOptions.text;
            return Promise.resolve({});
        });

        (nodemailer.createTransport as jest.Mock).mockReturnValue({
            sendMail: sendMailMock,
        });

        await request(app).post("/user/signup").send({
            username: "test",
            email: "test@gmail.com",
            password: "test",
        });
    });

    describe("Signing up", () => {
        it("should create a user in database upon signup", async () => {
            await request(app)
                .post("/user/signup")
                .send({
                    username: "signup_test",
                    email: "signup_test@gmail.com",
                    password: "signup_test",
                })
                .expect(200);
        });

        it("should fail if username or password are already in use", async () => {
            await request(app)
                .post("/user/signup")
                .send({
                    username: "test",
                    email: "test@gmail.com",
                    password: "test",
                })
                .expect(403);
        });

        it("should fail if a field is not provided", async () => {
            await request(app)
                .post("/user/signup")
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
                .post("/user/signin")
                .send({ credential: "test", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            expect(cookies).toBeDefined();
        });

        it("should sign in with valid email", async () => {
            const response = await request(app)
                .post("/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            expect(cookies).toBeDefined();
        });

        it("should fail to login if username is not valid", async () => {
            await request(app)
                .post("/user/signin")
                .send({ credential: "testwrong", password: "test" })
                .expect(401);
        });

        it("should fail to login if email is not valid", async () => {
            await request(app)
                .post("/user/signin")
                .send({ credential: "testwrong@gmail.com", password: "test" })
                .expect(401);
        });

        it("should fail to login if password is not valid", async () => {
            await request(app)
                .post("/user/signin")
                .send({ credential: "test", password: "testwrong" })
                .expect(401);
        });

        it("should fail if username or password in empty", async () => {
            await request(app)
                .post("/user/signin")
                .send({ credential: "", password: "test" })
                .expect(400);
        });
    });

    describe("Forget password", () => {
        it("should send forget email", async () => {
            await request(app)
                .post("/user/forgetpassword")
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
                "http://37.32.6.230:3000/reset-password/"
            );
        });

        it("should fail if credential is empty", async () => {
            await request(app)
                .post("/user/forgetpassword")
                .send({ credential: "" })
                .expect(400);
        });

        it("should fail if credential is not valid", async () => {
            await request(app)
                .post("/user/forgetpassword")
                .send({ credential: "notvalid" })
                .expect(401);
        });
    });

    describe("Reset password", () => {
        it("should reset password", async () => {
            await request(app)
                .post("/user/forgetpassword")
                .send({ credential: "test" });
            const emailContent = sendMailMock.mock.calls[0][0].text;
            const tokenMatch = emailContent.match(
                /reset-password\/([a-zA-Z0-9-_\.]+)$/
            );
            const token = tokenMatch ? tokenMatch[1] : null;
            await request(app)
                .post("/user/resetpassword")
                .send({ newPass: "newPass", token: token })
                .expect(200);
        });

        it("should fail if token is wrong or expired", async () => {
            await request(app)
                .post("/user/resetpassword")
                .send({ newPass: "newPass", token: "wrong token" });
        });
    });

    describe("get edit profile", () => {
        it("should login and get edit profile page", async () => {
            let cookie;
            const response = await request(app)
                .post("/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            cookie = cookies[0];
            expect(cookies).toBeDefined();

            const response_getEdit_profile = await request(app)
                .get("/user/geteditprofile")
                .set("Cookie", [cookie]);
            expect(response_getEdit_profile.status).toBe(200);

            expect(response_getEdit_profile.body).toHaveProperty("firstname");
        });

        it("should fail if token is not specified", async () => {
            let cookie;
            const response = await request(app)
                .post("/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            cookie = cookies[0];
            expect(cookies).toBeDefined();

            const response_getEdit_profile = await request(app).get(
                "/user/geteditprofile"
            );
            expect(response_getEdit_profile.status).toBe(401);
        });

        it("should fail if token is not valid", async () => {
            let cookie;
            const response = await request(app)
                .post("/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            cookie = cookies[0];
            expect(cookies).toBeDefined();

            const response_getEdit_profile = await request(app)
                .get("/user/geteditprofile")
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
                .post("/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            cookie = cookies[0];
            expect(cookies).toBeDefined();

            const response_profile_info = await request(app)
                .get("/user/profileInfo")
                .set("Cookie", [cookie]);
            expect(response_profile_info.status).toBe(200);

            expect(response_profile_info.body).toHaveProperty("follower_count");
        });

        it("should fail if token is not specified", async () => {
            let cookie;
            const response = await request(app)
                .post("/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            cookie = cookies[0];
            expect(cookies).toBeDefined();

            const response_profile_info = await request(app).get(
                "/user/profileInfo"
            );
            expect(response_profile_info.status).toBe(401);
        });

        it("should fail if token is not valid", async () => {
            let cookie;
            const response = await request(app)
                .post("/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            cookie = cookies[0];
            expect(cookies).toBeDefined();

            const response_profile_info = await request(app)
                .get("/user/profileInfo")
                .set("Cookie", [
                    "token=yyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.              eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3MjI5NzQ3MTEsImV4cCI6MTcyMzAwMzUxMX0.1oB7dtlTun4wRnvh9U-RqBc3q_7QvECZt7QM1zFRYZQ; Path=/; HttpOnly",
                ]);

            expect(response_profile_info.status).toBe(401);
        });
    });

    describe("Editing Profile", () => {
        it("should update profile", async () => {
            const response = await request(app)
                .post("/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            const cookie = cookies[0];
            expect(cookies).toBeDefined();

            const response_editprofile = await request(app)
                .post("/user/editprofile")
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
            expect(
                await bcrypt.compare(
                    "newpass",
                    response_editprofile.body.password
                )
            ).toBe(true);
        });

        it("should fail to update profile if cookie token is not valid", async () => {
            await request(app)
                .post("/user/editprofile")
                .set("Cookie", ["wrong cookie"])
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
                .post("/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            const cookie = cookies[0];
            expect(cookies).toBeDefined();

            const response_editprofile = await request(app)
                .post("/user/editprofile")
                .set("Cookie", [cookie])
                .field("email", "changedemail@gmail.com")
                .field("firstName", "test")
                .field("lastName", "test")
                .field("profileStatus", "private")
                .field("bio", "test")
                .field("password", "newpass")
                .attach("profileImage", Buffer.from(""), "testFile.jpg");

            // Expect response fields to be updated
            expect(response_editprofile.status).toBe(200);
            expect(response_editprofile.body.email).toBe(
                "changedemail@gmail.com"
            );
            expect(response_editprofile.body.firstName).toBe("test");
            expect(response_editprofile.body.profileStatus).toBe("private");
            expect(
                await bcrypt.compare(
                    "newpass",
                    response_editprofile.body.password
                )
            ).toBe(true);
        });

        it("should fail to upload file if it is text", async () => {
            const response = await request(app)
                .post("/user/signin")
                .send({ credential: "test@gmail.com", password: "test" })
                .expect(200);
            const cookies = response.headers["set-cookie"];
            const cookie = cookies[0];
            expect(cookies).toBeDefined();

            await request(app)
                .post("/user/editprofile")
                .set("Cookie", [cookie])
                .field("email", "changedemail@gmail.com")
                .field("firstName", "test")
                .field("lastName", "test")
                .field("profileStatus", "private")
                .field("bio", "test")
                .field("password", "newpass")
                .attach("profileImage", Buffer.from(""), "testFile.txt").expect(400);
        });
    });
});
