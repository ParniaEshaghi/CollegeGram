import { hashGenerator } from "../../utility/hash-generator";
import { HttpError } from "../../utility/http-errors";
import { SignUpDto } from "./dto/user.dto";
import { User } from "./model/user.model";
import { UserRepository } from "./user.repository";

export class UserService {
    constructor(private userRepo: UserRepository) {}

    async createUser(dto: SignUpDto): Promise<User> {
        if (await this.userRepo.findByEmail(dto.email) || await this.userRepo.findByUsername(dto.username)) {
            throw new HttpError(403, "Username and/or email already in use");
        }

        const password_hash = await hashGenerator(dto.password);

        return this.userRepo.create({
            username: dto.username,
            password: password_hash,
            email: dto.email,
            profilePicture: "",
            firstName: "",
            lastName: "",
            profileStatus: "public",
            bio: "",
            follower_count: 0,
            following_count: 0,
            post_count: 0,
            tokens: [],
        })
    }
}