import { AppDataSource } from "../../data-source";
import { UserRepository } from "../../modules/user/user.repository";
import { UserService } from "../../modules/user/user.service";
import bcrypt from "bcrypt";
import { HttpError } from "../../utility/http-errors";
import { hashGenerator } from "../../utility/hash-generator";

describe("User service test suite", () => {
    let userRepo: UserRepository;
    let userService: UserService;

    beforeAll(async () => {
        const dataSource = await AppDataSource.initialize();
        userRepo = new UserRepository(dataSource);
        userService = new UserService(userRepo);
        userService.createUser({ username: "mahdi", email: "mahdi@gmail.com", password: "1234mm" })
    });
    afterAll(async () => {
        await AppDataSource.dropDatabase();
        await AppDataSource.destroy();
    });

    describe("Signup test", () => {
        it("should sign up a user", async () => {
            const user = await userService.createUser({ username: "test", email: "test@gmail.com", password: "test" });
            expect(user.email).toBe("test@gmail.com");
            expect(user.username).toBe("test");
            expect(await bcrypt.compare("test", await hashGenerator("test"))).toBe(true)
        })

        it("should fail to sign up if email or username is already in use", () => {
            expect(userService.createUser({ username: "test", email: "test@gmail.com", password: "test" })).rejects.toThrow(HttpError);
        })
    })

    describe("login test", () => {
        it("should login with valid username", async () => {
            const response = await userService.login("mahdi", "1234mm");
            expect(response.message).toBe("Login successfull");
        });

        it("should login with valid email", async () => {
            const response = await userService.login("mahdi@gmail.com", "1234mm");
            expect(response.message).toBe("Login successfull");
        });

        it("should fail if password is not valid", async () => {
            expect(userService.login("test@gmail.com", "11111")).rejects.toThrow(new HttpError(401, "Invalid credential or password"))
        });

        it("should fail if username is not valid", async () => {
            expect(userService.login("testwrongusername", "11111")).rejects.toThrow(new HttpError(401, "Invalid credential or password"))
        });

        it("should fail if email is not valid", async () => {
            expect(userService.login("testwrong@gmail.com", "11111")).rejects.toThrow(new HttpError(401, "Invalid credential or password"))
        });

        it("should fail if username or password in empty", async () => {
            expect(userService.login("", "")).rejects.toThrow(new HttpError(400, "Credential and password are required"))

        });
    });

});

