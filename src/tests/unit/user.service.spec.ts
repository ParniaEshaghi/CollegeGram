import { AppDataSource } from "../../data-source";
import { UserRepository } from "../../modules/user/user.repository";
import { UserService } from "../../modules/user/user.service";
import bcrypt from "bcrypt";
import { HttpError } from "../../utility/http-errors";
import { hashGenerator } from "../../utility/hash-generator";
import { PasswordResetTokenRepository } from "../../modules/user/forgetPassword.repository";

describe("User service test suite", () => {
    let userRepo: UserRepository;
    let passwordResetTokenRepo: PasswordResetTokenRepository;
    let userService: UserService;

    beforeAll(async () => {
        const dataSource = await AppDataSource.initialize();
        userRepo = new UserRepository(dataSource);
        passwordResetTokenRepo = new PasswordResetTokenRepository(dataSource);

        userService = new UserService(userRepo, passwordResetTokenRepo);
        userService.createUser({
            username: "mahdi",
            email: "mrmahdifardi@gmail.com",
            password: "1234mm",
        });

        userService.createUser({
            username: "parnia",
            email: "parniaeshaghi@gmail.com",
            password: "parnia",
        });
    });
    afterAll(async () => {
        await AppDataSource.dropDatabase();
        await AppDataSource.destroy();
    });

    describe("Signup test", () => {
        it("should sign up a user", async () => {
            const user = await userService.createUser({
                username: "test",
                email: "test@gmail.com",
                password: "test",
            });
            expect(user.email).toBe("test@gmail.com");
            expect(user.username).toBe("test");
            expect(
                await bcrypt.compare("test", await hashGenerator("test"))
            ).toBe(true);
        });

        it("should fail to sign up if email or username is already in use", () => {
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
            const response = await userService.login({ credential: "test", password: "test" });
            expect(response.message).toBe("Login successfull");
        });

        it("should login with valid email", async () => {
            const response = await userService.login({ credential: "test@gmail.com", password: "test" });
            expect(response.message).toBe("Login successfull");
        });

        it("should fail if password is not valid", async () => {
            expect(userService.login({ credential: "test@gmail.com", password: "11111" })).rejects.toThrow(
                new HttpError(401, "Invalid credential or password"))
        });

        it("should fail if username is not valid", async () => {
            expect(userService.login({ credential: "testwrongusername", password: "11111" })).rejects.toThrow(
                new HttpError(401, "Invalid credential or password"))
        });

        it("should fail if email is not valid", async () => {
            expect(userService.login({ credential: "testwrong@gmail.com", password: "11111" })).rejects.toThrow(
                new HttpError(401, "Invalid credential or password"))
        });
    });

    describe("Reset password", () => {
        // it works
        it.skip("should send reset password email", async () => {
            const response = await userService.forgetPassword(
                "parniaeshaghi@gmail.com"
            );
            console.log(response);
            expect(response.message).toBe(
                "Password reset link sent to your email account"
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

        //TODO: find a way to test the token
        it("should reset password", async () => {

        });

        it("should fail to reset password if token is expired or wrong", async () => {
            expect(userService.resetPassword("test", "wrongtoken")).rejects.toThrow(
                new HttpError(401, "Authentication failed.")
            );
        });
    });
});
