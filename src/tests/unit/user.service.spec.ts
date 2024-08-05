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

    });
    // afterEach(async () => {
    //     await AppDataSource.destroy();
    //     await AppDataSource.dropDatabase();
    // });

    describe("login test", () => {
        it("should login with valid username", async () => {
            const result = await userService.login("mahdi", "1234mm");
            expect(result.message).toBe("Login successfull");
        });

        it("sould login with valid email", async () => {
            const result = await userService.login("test@gmail.com", "1234mm");
            expect(result.message).toBe("Login successfull");
        });
        it("should fail if password is not valid", async () => {
            try {
                await userService.login("test@gmail.com", "111111");
            } catch (e) {
                expect(e).toHaveProperty(
                    "message",
                    "Invalid credential or password"
                );
                expect(e).toHaveProperty("status", 401);
            }
        });
        it("should fail if username is not valid", async () => {
            try {
                await userService.login("testwrongusername", "111111");
            } catch (e) {
                expect(e).toHaveProperty(
                    "message",
                    "Invalid credential or password"
                );
                expect(e).toHaveProperty("status", 401);
            }
        });
        it("should fail if email is not valid", async () => {
            try {
                await userService.login("testwrong@gmail.com", "111111");
            } catch (e) {
                expect(e).toHaveProperty(
                    "message",
                    "Invalid credential or password"
                );
                expect(e).toHaveProperty("status", 401);
            }
        });

        it("should fail if username or password in empty", async () => {
            try {
                await userService.login("", "");
            } catch (e) {
                expect(e).toHaveProperty(
                    "message",
                    "Credential and password are required"
                );
                expect(e).toHaveProperty("status", 400);
            }
        });
    });
    it("should sign up a user", async () => {
        const user = await userService.createUser({ username: "test", email: "test@gmail.com", password: "test" });
        expect(user.email).toBe("test@gmail.com");
        expect(user.username).toBe("test");
        expect(await bcrypt.compare("test", await hashGenerator("test"))).toBe(true)
    })

    it("should fail to sign up if email or username is already in use", () => {
        expect(userService.createUser({ username: "test", email: "test@gmail.com", password: "test" })).rejects.toThrow(HttpError);
    })
});

