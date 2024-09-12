import {
    BadRequestError,
    DuplicateError,
    InvalidCredentialError,
    NotFoundError,
} from "../../../utility/http-errors";
import { hashGenerator } from "../../../utility/hash-generator";
import { SignUpDto } from "./dto/signup.dto";
import {
    toEditProfileInfo,
    toProfileInfo,
    toUserSuggestion,
    toUserWithoutPassword,
    User,
    UserSearchSuggestion,
    userSearchUser,
    UserWithoutPassword,
} from "./model/user.model";
import { UserRepository } from "./user.repository";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { LoginDto } from "./dto/login.dto";
import { EditProfileDto } from "./dto/edit-profile.dto";
import { ForgetPasswordService } from "../forgetPassword/forgetPassword.service";

export class UserService {
    constructor(
        private userRepo: UserRepository,
        private forgetPasswordService: ForgetPasswordService
    ) {}

    async createUser(dto: SignUpDto): Promise<UserWithoutPassword> {
        const [emailResult, usernameResult] = await Promise.allSettled([
            this.getUserByEmail(dto.email),
            this.getUserByUsername(dto.username),
        ]);

        if (
            emailResult.status === "fulfilled" ||
            usernameResult.status === "fulfilled"
        ) {
            throw new DuplicateError();
        }

        const user = await this.userRepo.create(dto);
        return toUserWithoutPassword(user);
    }

    public async login(dto: LoginDto) {
        const { success, error } = z.string().email().safeParse(dto.credential);

        let user;
        try {
            user = success
                ? await this.getUserByEmail(dto.credential)
                : await this.getUserByUsername(dto.credential);
        } catch {
            throw new InvalidCredentialError();
        }

        const match = await bcrypt.compare(dto.password, user.password);
        if (!match) {
            throw new InvalidCredentialError();
        }

        const expiry = dto.keepMeSignedIn ? "7d" : "8h";
        const token = jwt.sign({ username: user.username }, "10", {
            expiresIn: expiry,
        });

        return { message: "Login successfull", token: token };
    }

    public async getUserByUsername(username: string) {
        const user = await this.userRepo.findByUsername(username);
        if (!user) {
            throw new NotFoundError();
        }
        return user;
    }

    public async getUserByEmail(credential: string) {
        const user = await this.userRepo.findByEmail(credential);
        if (!user) {
            throw new NotFoundError();
        }
        return user;
    }

    public async forgetPassword(credential: string) {
        if (!credential) {
            throw new BadRequestError();
        }
        const { success, error } = z.string().email().safeParse(credential);
        const user = success
            ? await this.getUserByEmail(credential)
            : await this.getUserByUsername(credential);

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
        return toEditProfileInfo(user, baseUrl);
    }

    public async editProfile(
        user: User,
        pictureFilename: string,
        dto: EditProfileDto,
        baseUrl: string
    ) {
        pictureFilename = pictureFilename
            ? pictureFilename
            : user.profilePicture;

        try {
            await this.userRepo.updateProfile(user, pictureFilename, dto);
        } catch (error) {
            throw new DuplicateError();
        }

        const updatedUser = await this.getUserByUsername(user.username);
        return toEditProfileInfo(updatedUser!, baseUrl);
    }

    public async getUserPosts(username: string, baseUrl: string) {
        const user = await this.getUserByUsername(username);
        const posts = await this.userRepo.getUserPosts(username);
        return posts;
    }

    public async getUserSearchSuggestion(
        query: string,
        baseUrl: string,
        limit: number
    ) {
        const queryResponse = await this.userRepo.getUserSearchSuggestion(
            query,
            limit
        );
        if (queryResponse) {
            return queryResponse.map((qr) => toUserSuggestion(qr, baseUrl));
        }

        return [];
    }

    public async userSearch(
        // user: User,
        query: string,
        // baseUrl: string,
        page: number,
        limit: number
    ) {
        return await this.userRepo.userSearch(query, page, limit);
    }
}
