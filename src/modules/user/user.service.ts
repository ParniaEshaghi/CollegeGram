import {
    BadRequestError,
    DuplicateError,
    InvalidCredentialError,
    UnauthorizedError,
} from "../../utility/http-errors";
import { hashGenerator } from "../../utility/hash-generator";
import { SignUpDto } from "./dto/signup.dto";
import {
    toEditProfileInfo,
    toProfileInfo,
    toUserWithoutPassword,
    User,
    UserWithoutPassword,
} from "./model/user.model";
import { UserRepository } from "./user.repository";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { LoginDto } from "./dto/login.dto";
import { EditProfileDto } from "./dto/edit-profile.dto";
import { ForgetPasswordService } from "./forgetPassword/forgetPassword.service";
import { EmailService } from "../email/email.service";
import { PostWithUsername, toProfilePost } from "../post/model/post.model";
import fs from "fs";

export class UserService {
    constructor(
        private userRepo: UserRepository,
        private forgetPasswordService: ForgetPasswordService
    ) {}

    async createUser(dto: SignUpDto): Promise<UserWithoutPassword> {
        if (
            (await this.userRepo.findByEmail(dto.email)) ||
            (await this.userRepo.findByUsername(dto.username))
        ) {
            throw new DuplicateError();
        }

        const user = await this.userRepo.create(dto);

        return toUserWithoutPassword(user);
    }

    public async login(dto: LoginDto) {
        const { success, error } = z.string().email().safeParse(dto.credential);

        const user = success
            ? await this.getUserByEmail(dto.credential)
            : await this.getUserByUsername(dto.credential);

        const match = await bcrypt.compare(dto.password, user?.password ?? "");
        if (!user || !match) {
            throw new InvalidCredentialError();
        }

        const expiry = dto.keepMeSignedIn ? "7d" : "8h";

        const token = jwt.sign({ username: user.username }, "10", {
            expiresIn: expiry,
        });

        return { message: "Login successfull", token: token };
    }

    public async getUserByUsername(username: string) {
        return await this.userRepo.findByUsername(username);
    }

    public async getUserByEmail(credential: string) {
        return await this.userRepo.findByEmail(credential);
    }

    public async forgetPassword(credential: string) {
        if (!credential) {
            throw new BadRequestError();
        }
        const { success, error } = z.string().email().safeParse(credential);
        const user = success
            ? await this.getUserByEmail(credential)
            : await this.getUserByUsername(credential);

        if (!user) {
            throw new InvalidCredentialError();
        }
        const { id, token } = await this.forgetPasswordService.createToken(
            user.username
        );
        return this.forgetPasswordService.sendForgetPasswordEmail(
            user.email,
            id,
            token
        );
    }

    public async resetPassword(newPass: string, token: string) {
        if (!newPass || !token) {
            throw new BadRequestError();
        }
        const password_hash = await hashGenerator(newPass);
        const username = await this.forgetPasswordService.checkToken(token);
        this.userRepo.updatePassword(username, password_hash);
        return { message: "New password set" };
    }

    public getEditProfile(user: User, baseUrl: string) {
        if (!user) {
            throw new UnauthorizedError();
        }
        return toEditProfileInfo(user, baseUrl);
    }

    public async editProfile(
        user: User,
        pictureFilename: string,
        dto: EditProfileDto,
        baseUrl: string
    ) {
        if (!user) {
            throw new UnauthorizedError();
        }
        const updatedUser = await this.userRepo.updateProfile(
            user,
            pictureFilename,
            dto
        );
        return toEditProfileInfo(updatedUser as User, baseUrl);
    }

    public async getProfileInfo(user: User, baseUrl: string) {
        if (!user) {
            throw new UnauthorizedError();
        }
        const posts = await this.getUserPosts(user.username, baseUrl);
        return toProfileInfo(user, posts, baseUrl);
    }

    public async getUserPosts(username: string, baseUrl: string) {
        const posts = await this.userRepo.getUserPosts(username);
        const profilePosts: PostWithUsername[] = posts.map((post) =>
            toProfilePost(username, post, baseUrl)
        );
        return profilePosts;
    }
}
