import { HttpError, NotFoundError } from "../../utility/http-errors";
import { hashGenerator } from "../../utility/hash-generator";
import { SignUpDto } from "./dto/user.dto";
import { User } from "./model/user.model";
import { UserRepository } from "./user.repository";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { hashGenerator } from "../../utility/hash-generator";

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

    public async login(credential: string, password: string) {
        if (!credential || !password) {
            throw new HttpError(400, "Credential and password are required");
        }

        const { success, error } = z.string().email().safeParse(credential);

        let user;

        if (success) {
            user = await this.getUserByEmail(credential);
        } else {
            user = await this.getUserByUsername(credential);
        }

        if (!user) {
            throw new HttpError(401, "Invalid credential or password");
        }

        const hashedPassword = await hashGenerator(password);

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            throw new HttpError(401, "Invalid credential or password");
        }

        const token = jwt.sign(
            { username: user.username },
            "10",
            { expiresIn: 1800 }

            // process.env.JWT_SECRET as string,
            // { expiresIn: process.env.JWT_EXPIRATION }
        );

        user.tokens = user.tokens.concat(token);
        this.userRepo.updateUser(user);

        return { message: "Login successfull", token: token };
    }

    public async getUserByUsername(username: string) {
        return await this.userRepo.getUserByUsername(username);
    }

    public async getUserByEmail(credential: string) {
        return await this.userRepo.getUserByEmail(credential);
    }
}
