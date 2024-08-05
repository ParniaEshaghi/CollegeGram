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
    })

    afterAll(async () => {
        await AppDataSource.dropDatabase();
        await AppDataSource.destroy();
    })

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