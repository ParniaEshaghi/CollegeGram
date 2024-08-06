import { HttpError, NotFoundError } from "../../utility/http-errors";
import { hashGenerator } from "../../utility/hash-generator";
import { SignUpDto } from "./dto/signup.dto";
import { User } from "./model/user.model";
import { UserRepository } from "./user.repository";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { LoginDto } from "./dto/login.dto";

export class UserService {
    constructor(private userRepo: UserRepository) { }

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
        })
    }

    public async login(dto: LoginDto) {
        const { success, error } = z.string().email().safeParse(dto.credential);

        const user = success ? await this.getUserByEmail(dto.credential) : await this.getUserByUsername(dto.credential);

        // if (success) {
        //     const user = await this.getUserByEmail(dto.credential);
        // } else {
        //     const user = await this.getUserByUsername(dto.credential);
        // }

        if (!user) {
            throw new HttpError(401, "Invalid credential or password");
        }

        const match = await bcrypt.compare(dto.password, user.password);
        if (!user || !match) {
            throw new HttpError(401, "Invalid credential or password");
        }

        const expiry = dto.keepMeSignedIn ? '7d' : '8h';

        const token = jwt.sign(
            { username: user.username },
            "10",
            { expiresIn: expiry }
        );

        return { message: "Login successfull", token: token };
    }

    public async getUserByUsername(username: string) {
        return await this.userRepo.findByUsername(username);
    }

    public async getUserByEmail(credential: string) {
        return await this.userRepo.findByEmail(credential);
    }
}
