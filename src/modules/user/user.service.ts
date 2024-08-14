import { HttpError, NotFoundError } from "../../utility/http-errors";
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
import { Post } from "../post/model/post.model";

export class UserService {
    constructor(
        private userRepo: UserRepository,
        private forgetPasswordService: ForgetPasswordService,
        private emailService: EmailService
    ) {}

    async createUser(dto: SignUpDto): Promise<UserWithoutPassword> {
        if (
            (await this.userRepo.findByEmail(dto.email)) ||
            (await this.userRepo.findByUsername(dto.username))
        ) {
            throw new HttpError(403, "Username and/or email already in use");
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
            throw new HttpError(401, "Invalid credential or password");
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
            throw new HttpError(400, "Credential is  required");
        }
        const { success, error } = z.string().email().safeParse(credential);
        const user = success
            ? await this.getUserByEmail(credential)
            : await this.getUserByUsername(credential);

        if (!user) {
            throw new HttpError(401, "Invalid credential");
        }
        const { id, token } = await this.forgetPasswordService.createToken(
            user.username
        );
        const mailContent = {
            reciever: user.email,
            subject: "Password Reset",
            text: `Click on the following link to reset your password: http://37.32.6.230/reset-password/${id}~${token}`,
        };
        return await this.emailService.sendEmail(mailContent);
    }

    public async resetPassword(newPass: string, token: string) {
        const password_hash = await hashGenerator(newPass);
        const username = await this.forgetPasswordService.checkToken(token);
        this.userRepo.updatePassword(username, password_hash);
        return { message: "New password set" };
    }

    public getEditProfile(user: User, baseUrl: string) {
        if (!user) {
            throw new HttpError(401, "Unauthorized");
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
            throw new HttpError(401, "Unauthorized");
        }
        const updatedUser = await this.userRepo.updateProfile(
            user,
            pictureFilename,
            dto
        );
        return toEditProfileInfo(updatedUser as User, baseUrl);
    }

    public getProfileInfo(user: User, baseUrl: string) {
        if (!user) {
            throw new HttpError(401, "Unauthorized");
        }
        return toProfileInfo(user, baseUrl);
    }

    public async getUserPosts(username: string): Promise<Post[]> {
        return await this.userRepo.getUserPosts(username);
    }
}
