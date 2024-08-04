import { AppDataSource } from "../../data-source";
import { UserRepository } from "../../modules/user/user.repository";
import { UserService } from "../../modules/user/user.service";

describe("User service test suite", ()=> {
    let userRepo: UserRepository;
    let userService: UserService;
    beforeEach(async () => {
        const dataSource = await AppDataSource.initialize();
        userRepo = new UserRepository(dataSource);
        userService = new UserService(userRepo);
    })
    afterEach(async () => {
        await AppDataSource.destroy();
    })
})