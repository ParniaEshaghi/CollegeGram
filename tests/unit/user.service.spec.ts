import { UserRepository } from "../../src/modules/user/user.repository";
import { UserService } from "../../src/modules/user/user.service";
import bcrypt from "bcrypt";
import { HttpError } from "../../src/utility/http-errors";
import { hashGenerator } from "../../src/utility/hash-generator";
import { PasswordResetTokenRepository } from "../../src/modules/user/forgetPassword.repository";
import { createTestDb } from "../../src/utility/test-db";
import nodemailer from "nodemailer";

jest.mock("nodemailer");

describe("User service test suite", () => {
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

        jest.clearAllMocks();

        sendMailMock = jest.fn().mockImplementation((mailOptions) => {
            emailContent = mailOptions.text;
            return Promise.resolve({});
        });

        (nodemailer.createTransport as jest.Mock).mockReturnValue({
            sendMail: sendMailMock,
        });

        await userService.createUser({
            username: "test",
            email: "test@gmail.com",
            password: "test",
        });
    });

    describe("Signup test", () => {
        it("should sign up a user", async () => {
            const user = await userService.createUser({
                username: "signup_test",
                email: "signup_test@gmail.com",
                password: "signup_test",
            });
            expect(user.email).toBe("signup_test@gmail.com");
            expect(user.username).toBe("signup_test");
            expect(
                await bcrypt.compare(
                    "signup_test",
                    await hashGenerator("signup_test")
                )
            ).toBe(true);
        });

        it("should fail to sign up if email or username is already in use", async () => {
            expect(
                userService.createUser({
                    username: "test",
                    email: "test@gmail.com",
                    password: "test",
                })
            ).rejects.toThrow(HttpError);
        });
    });

    describe("login test", () => {
        it("should login with valid username", async () => {
            const response = await userService.login({
                credential: "test",
                password: "test",
            });
            expect(response.message).toBe("Login successfull");
        });

        it("should login with valid email", async () => {
            const response = await userService.login({
                credential: "test@gmail.com",
                password: "test",
            });
            expect(response.message).toBe("Login successfull");
        });

        it("should fail if password is not valid", async () => {
            expect(
                userService.login({
                    credential: "test@gmail.com",
                    password: "11111",
                })
            ).rejects.toThrow(
                new HttpError(401, "Invalid credential or password")
            );
        });

        it("should fail if username is not valid", async () => {
            expect(
                userService.login({
                    credential: "testwrongusername",
                    password: "11111",
                })
            ).rejects.toThrow(
                new HttpError(401, "Invalid credential or password")
            );
        });

        it("should fail if email is not valid", async () => {
            expect(
                userService.login({
                    credential: "testwrong@gmail.com",
                    password: "11111",
                })
            ).rejects.toThrow(
                new HttpError(401, "Invalid credential or password")
            );
        });
    });

    describe("Reset password", () => {
        it("should send reset password email", async () => {
            const response = await userService.forgetPassword("test@gmail.com");

            expect(sendMailMock).toHaveBeenCalledTimes(1);
            expect(sendMailMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: "test@gmail.com",
                })
            );
            expect(response.message).toBe(
                "Password reset link sent to your email account"
            );
            expect(emailContent).toBeDefined();
            expect(emailContent).toContain(
                "http://37.32.6.230:3000/reset-password/"
            );
        });

        it("should fail if credential is  empty", async () => {
            expect(userService.forgetPassword("")).rejects.toThrow(
                new HttpError(400, "Credential is  required")
            );
        });

        it("should fail if credential is not valid", async () => {
            expect(userService.forgetPassword("notvalid")).rejects.toThrow(
                new HttpError(401, "Invalid credential")
            );
        });

        it("should reset password", async () => {
            await userService.forgetPassword("test@gmail.com");
            const emailContent = sendMailMock.mock.calls[0][0].text;
            const tokenMatch = emailContent.match(
                /reset-password\/([a-zA-Z0-9-_\.]+)$/
            );
            const token = tokenMatch ? tokenMatch[1] : null;
            const response = await userService.resetPassword(
                "reset test",
                token
            );
            expect(response.message).toBe("New password set");
        });

        it("should fail to reset password if token is expired or wrong", async () => {
            expect(
                userService.resetPassword("test", "wrongtoken")
            ).rejects.toThrow(new HttpError(401, "Authentication failed."));
        });
    });

    describe("Edit profile", () => {
        it("should update profile without image", async () => {
            const hashed_password = await hashGenerator("test");
            const response = await userService.editProfile(
                "test",
                hashed_password,
                "",
                {
                    email: "changedemail@gmail.com",
                    firstName: "test",
                    lastName: "test",
                    profileStatus: "private",
                    bio: "test",
                    password: "newpass",
                }
            );
            expect(response.email).toBe("changedemail@gmail.com");
            expect(response.firstName).toBe("test");
            expect(response.profileStatus).toBe("private");
            expect(await bcrypt.compare("newpass", response.password)).toBe(
                true
            );
        });
    });
});
